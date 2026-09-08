"""Validate by default; --apply imports unpublished courses through authenticated admin APIs."""
import argparse, getpass, hashlib, json, os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from urllib.error import HTTPError

HERE=Path(__file__).resolve().parent
FILES=['react.json','vue.json','javascript-node.json','python-django.json']

def validate():
    packages=[]
    for name in FILES:
        package=json.loads((HERE/name).read_text(encoding='utf-8'))
        assert package['schemaVersion']==1
        assert package['course']['published'] is False
        assert len(package['course']['shortDescription'])<=500
        assert len(package['lessons'])==6
        stems=[]
        for lesson in package['lessons']:
            assert len(lesson['class']['sections'])>=8
            assert lesson['class']['cohortId'] is None and lesson['class']['meetingLink'] is None
            assert len(lesson['quiz']['questions'])==10
            assert lesson['assignment']['rubric'] and lesson['assignment']['maxScore']==100
            for q in lesson['quiz']['questions']:
                stems.append(q['text'])
                assert len(q['options'])==4 and sum(o['correct'] for o in q['options'])==1
                assert len({o['text'] for o in q['options']})==4 and q['points']>0
        assert len(set(stems))==60
        packages.append(package)
    print('Validated: 4 unpublished courses, 24 lessons, 240 questions, 24 assignments and rubrics.')
    return packages

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply',action='store_true')
    parser.add_argument('--base-url',default='http://localhost:8080')
    parser.add_argument('--journal',type=Path,default=HERE/'import-journal.json')
    args=parser.parse_args()
    packages=validate()
    if not args.apply:
        print('Validation only. Use --apply with a running backend and an administrator account to import.')
        return
    base=args.base_url.rstrip('/')
    parsed=urlparse(base)
    if parsed.scheme!='https' and not(parsed.scheme=='http' and parsed.hostname in ('localhost','127.0.0.1','::1')):
        raise SystemExit('Use HTTPS for a remote server.')
    fingerprint=hashlib.sha256(''.join((HERE/n).read_text(encoding='utf-8') for n in FILES).encode()).hexdigest()
    journal=json.loads(args.journal.read_text()) if args.journal.exists() else {'baseUrl':base,'packageHash':fingerprint,'completed':{}}
    if journal['baseUrl']!=base or journal['packageHash']!=fingerprint:
        raise SystemExit('Journal belongs to another server or package revision. Use a separate journal.')
    if journal.get('pending'):
        raise SystemExit('A previous request has an uncertain outcome: '+journal['pending']+'. Inspect the admin data before reconciling the journal; no request has been repeated.')
    token=os.environ.get('LMS_ADMIN_TOKEN')
    def request(method,path,data=None):
        headers={'Content-Type':'application/json'}
        if token:headers['Authorization']='Bearer '+token
        req=Request(base+path,data=None if data is None else json.dumps(data).encode(),headers=headers,method=method)
        try:
            with urlopen(req,timeout=45) as response:
                body=response.read()
                return json.loads(body) if body else None
        except HTTPError as error:
            raise RuntimeError(f'{method} {path}: HTTP {error.code}. Inspect the backend log; the importer does not print credentials or request bodies.') from None
    if not token:
        email=input('Admin email: ').strip()
        token=request('POST','/api/admin/login',{'email':email,'password':getpass.getpass('Admin password: ')})['token']
    def save():
        temporary=args.journal.with_suffix('.tmp')
        temporary.write_text(json.dumps(journal,indent=2),encoding='utf-8')
        temporary.replace(args.journal)
    def step(key,method,path,data=None):
        if key in journal['completed']:return journal['completed'][key]
        journal['pending']=key;save()
        result=request(method,path,data)
        journal['completed'][key]=result
        journal.pop('pending',None);save()
        return result
    existing=request('GET','/api/admin/courses')
    for package in packages:
        slug=package['course']['slug'];prefix=slug+'/'
        if prefix+'course' not in journal['completed'] and any(c['slug']==slug for c in existing):
            raise SystemExit('Draft slug already exists without a matching journal: '+slug+'. Existing content was not changed.')
        course=step(prefix+'course','POST','/api/admin/courses',package['course'])['id']
        step(prefix+'criteria','PUT',f'/api/admin/courses/{course}/completion-criteria',package['completionCriteria'])
        module=step(prefix+'module','POST',f'/api/admin/courses/{course}/modules',package['module'])['id']
        for index,lesson in enumerate(package['lessons'],1):
            key=prefix+str(index)+'/'
            session=step(key+'lesson','POST',f'/api/admin/modules/{module}/class-sessions',lesson['class'])['id']
            quiz=step(key+'quiz','POST',f'/api/admin/class-sessions/{session}/quiz',{})['id']
            step(key+'settings','PUT',f'/api/admin/quizzes/{quiz}/settings',lesson['quiz']['settings'])
            for number,question in enumerate(lesson['quiz']['questions'],1):
                step(key+f'question-{number}','POST',f'/api/admin/quizzes/{quiz}/questions',question)
            assignment=step(key+'assignment','POST',f'/api/admin/class-sessions/{session}/assignment',{})['id']
            step(key+'rubric','PUT',f'/api/admin/assignments/{assignment}',lesson['assignment'])
        print('Imported draft:',package['course']['title'])
    print('All four courses remain unpublished. Assign instructor, pricing, cohort schedules and deadlines before publication.')

if __name__=='__main__':main()
