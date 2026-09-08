import { useEffect,useRef,useState } from "react";
import { isAxiosError } from "axios";
import { apiClient } from "../../api/client";
type Draft={responseText:string;version:number;submissionVersion:number;updatedAt:string|null};
export function useAssignmentDraft(assignmentId:number,storageKey:string,initialText:string,editable:boolean){
 const [text,setText]=useState(initialText),[savedText,setSavedText]=useState(initialText);
 const [version,setVersion]=useState(0),[submissionVersion,setSubmissionVersion]=useState(-1);
 const [ready,setReady]=useState(!editable),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const [conflict,setConflict]=useState<Draft|null>(null),[reload,setReload]=useState(0);
 const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{
  if(!editable)return;
  let cancelled=false;setReady(false);setError("");
  apiClient.get<Draft>(`/api/student/assignments/${assignmentId}/draft`).then(({data})=>{
   if(cancelled)return;
   let local:string|null=null;try{local=sessionStorage.getItem(storageKey);}catch{/* Storage is optional. */}
   setVersion(data.version);setSubmissionVersion(data.submissionVersion);setSavedText(data.responseText||"");
   if(local!==null&&local!==data.responseText&&data.updatedAt){setText(local);setConflict(data);}
   else {setText(data.updatedAt?data.responseText:(local??data.responseText??initialText));setConflict(null);}
   setReady(true);
  }).catch(()=>{if(!cancelled)setError("Could not restore your account draft. Retry before editing.");});
  return()=>{cancelled=true;};
 },[assignmentId,storageKey,editable,reload,initialText]);
 useEffect(()=>{
  if(!editable||!ready)return;
  try{sessionStorage.setItem(storageKey,text);}catch{/* Cloud autosave still works. */}
  if(text===savedText||saving||conflict||error)return;
  const timer=setTimeout(()=>{
   setSaving(true);
   apiClient.put<Draft>(`/api/student/assignments/${assignmentId}/draft`,{responseText:text,version,submissionVersion}).then(({data})=>{
    if(!mounted.current)return;setVersion(data.version);setSavedText(data.responseText);
   }).catch(async failure=>{
    if(!mounted.current)return;
    if(isAxiosError(failure)&&failure.response?.status===409){
     try{const {data}=await apiClient.get<Draft>(`/api/student/assignments/${assignmentId}/draft`);if(mounted.current){setConflict(data);setError("A newer draft or submission exists. Your text is still here.");}}
     catch{if(mounted.current)setError("Could not retrieve the newer draft. Keep this tab open and retry.");}
    }else setError("Not synced. Your text is kept in this tab. Check your connection and retry.");
   }).finally(()=>{if(mounted.current)setSaving(false);});
  },900);
  return()=>clearTimeout(timer);
 },[text,savedText,version,submissionVersion,editable,ready,saving,conflict,error,assignmentId,storageKey]);
 const resolve=(keepLocal:boolean)=>{if(!conflict)return;if(conflict.submissionVersion!==submissionVersion){window.location.reload();return;}setVersion(conflict.version);setSavedText(conflict.responseText);if(!keepLocal)setText(conflict.responseText);setConflict(null);setError("");};
 const submitted=()=>{setSavedText(text);try{sessionStorage.removeItem(storageKey);}catch{/* optional */}};
 return {text,setText,ready,saving,error,conflict,dirty:text!==savedText,resolve,submitted,retry:()=>{if(ready)setError("");else setReload(n=>n+1);}};
}
