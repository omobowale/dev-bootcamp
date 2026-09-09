import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCalendar,getInbox,getReminderPreferences,markNoticesRead,saveReminderPreferences,type ReminderPreferences } from "../../api/student/workspace";
import { StudentTools } from "../../components/StudentTools";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Select } from "../../components/Select";
import { Checkbox } from "../../components/Checkbox";
import { Icon } from "../../components/Icon";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { downloadCalendar } from "../../utils/learningCalendar";
import "./StudentDashboardPage.css";
import "../../workspace.css";
const dateLabel=(date:Date)=>date.toLocaleDateString(undefined,{month:"short",day:"numeric"});
function monday(){const day=new Date();day.setHours(0,0,0,0);day.setDate(day.getDate()-((day.getDay()+6)%7));return day;}
function ReminderSettings(){
 const cache=useQueryClient();const q=useQuery({queryKey:["student","workspace","preferences"],queryFn:getReminderPreferences});
 const save=useMutation({mutationFn:saveReminderPreferences,meta:{notify:true},onSuccess:data=>{cache.setQueryData(["student","workspace","preferences"],data);cache.invalidateQueries({queryKey:["student","workspace","notifications"]});}});
 if(q.isError)return <ErrorState message="Could not load reminder settings." onRetry={()=>q.refetch()}/>;
 if(!q.data)return <LoadingState label="Loading reminder settings…"/>;
 const update=(patch:Partial<ReminderPreferences>)=>save.mutate({...q.data!,...patch});
 return <aside className="card workspace-settings"><span className="eyebrow">YOUR RHYTHM</span><h2>A little heads-up.</h2><p className="text-muted">Choose when upcoming classes and deadlines appear in Updates.</p>
 <label className="workspace-toggle"><Checkbox checked={q.data.enabled} disabled={save.isPending} onChange={e=>update({enabled:e.target.checked})}/>Show learning reminders</label>
 <label className="form-field">Remind me<Select aria-label="Reminder window" value={q.data.hoursBefore} disabled={!q.data.enabled||save.isPending} onChange={e=>update({hoursBefore:Number(e.target.value)})}>{[[1,"1 hour before"],[6,"6 hours before"],[24,"1 day before"],[48,"2 days before"],[168,"1 week before"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</Select></label>
 <p className="text-muted workspace-small">Your exported calendar includes this reminder. Calendar apps control whether alerts are displayed. Schedule changes require a fresh export.</p></aside>;
}
function Planner(){
 const [week,setWeek]=useState(monday);const end=new Date(week);end.setDate(end.getDate()+7);
 const q=useQuery({queryKey:["student","workspace","calendar",week.toISOString()],queryFn:()=>getCalendar(week.toISOString(),end.toISOString())});
 const prefs=useQuery({queryKey:["student","workspace","preferences"],queryFn:getReminderPreferences});
 const shift=(days:number)=>setWeek(previous=>{const next=new Date(previous);next.setDate(next.getDate()+days);return next;});
 const days=Array.from({length:7},(_,i)=>{const date=new Date(week);date.setDate(date.getDate()+i);return date;});
 const last=new Date(end);last.setDate(last.getDate()-1);
 return <><div className="workspace-heading"><div><span className="eyebrow">MAKE SPACE TO LEARN</span><h1>Your week, in focus.</h1><p className="text-muted">Classes and deadlines, together in one place.</p></div><button className="btn btn-secondary" disabled={!q.data?.length||!prefs.data||q.isFetching} onClick={()=>downloadCalendar(q.data!,prefs.data!)}><Icon name="download" size={17}/>Export this week</button></div>
 <div className="workspace-columns"><section className="workspace-agenda"><div className="workspace-week-controls"><h2>{dateLabel(week)} – {dateLabel(last)}, {last.getFullYear()}</h2><div><button className="icon-btn" aria-label="Previous week" onClick={()=>shift(-7)}>←</button><button className="btn btn-secondary" onClick={()=>setWeek(monday())}>Today</button><button className="icon-btn" aria-label="Next week" onClick={()=>shift(7)}>→</button></div></div><p className="text-muted workspace-small">Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}.</p>
 {q.isLoading&&<LoadingState label="Finding your classes…"/>}{q.isError&&<ErrorState message="Could not load your week." onRetry={()=>q.refetch()}/>}
 {q.data&&days.map(day=>{const events=q.data.filter(e=>new Date(e.startsAt).toDateString()===day.toDateString());const today=day.toDateString()===new Date().toDateString();return <section key={day.toISOString()} className={`workspace-day ${today?"is-today":""}`} aria-label={day.toDateString()}><div className="workspace-day__date"><span>{day.toLocaleDateString(undefined,{weekday:"short"})}</span><strong>{day.getDate()}</strong>{today&&<small>Today</small>}</div><div className="workspace-day__events">{events.length?events.map(event=><Link className={`workspace-event workspace-event--${event.kind.toLowerCase()}`} to={event.path} key={event.id}><span className="workspace-event__kind">{event.kind==="CLASS"?"LIVE CLASS":"ASSIGNMENT DUE"}<time>{new Date(event.startsAt).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})}</time></span><strong>{event.title}</strong><span>{event.courseTitle}</span>{event.kind==="ASSIGNMENT"&&<small>{event.status.replaceAll("_"," ").toLowerCase()}</small>}</Link>):<p className="workspace-free">Room to practice, review, or take a break.</p>}</div></section>;})}</section><ReminderSettings/></div></>;
}
function Notifications(){
 const [unreadOnly,setUnreadOnly]=useState(false);const cache=useQueryClient();
 const q=useQuery({queryKey:["student","workspace","notifications"],queryFn:getInbox,refetchInterval:60000});
 const read=useMutation({mutationFn:markNoticesRead,meta:{notify:true},onSuccess:()=>cache.invalidateQueries({queryKey:["student","workspace","notifications"]})});
 const items=q.data?.items.filter(n=>!unreadOnly||!n.read)??[];
 return <><div className="workspace-heading"><div><span className="eyebrow">STAY IN THE LOOP</span><h1>Your learning updates.</h1><p className="text-muted">Feedback, upcoming deadlines and milestones worth noticing.</p></div><button className="btn btn-secondary" disabled={!q.data?.unreadCount||read.isPending} onClick={()=>read.mutate(q.data!.items.filter(n=>!n.read).map(n=>n.id))}><Icon name="check" size={17}/>Mark all as read</button></div><div className="workspace-columns"><section><div className="workspace-tabs" aria-label="Filter updates"><button aria-pressed={!unreadOnly} onClick={()=>setUnreadOnly(false)}>All updates</button><button aria-pressed={unreadOnly} onClick={()=>setUnreadOnly(true)}>Unread <span>{q.data?.unreadCount??0}</span></button></div>
 {q.isLoading&&<LoadingState label="Loading your updates…"/>}{q.isError&&<ErrorState message="Could not load your updates." onRetry={()=>q.refetch()}/>}
 {q.data&&items.length===0&&<div className="card workspace-empty"><Icon name="check" size={30}/><h2>You're all caught up.</h2><p className="text-muted">New feedback and reminders will appear here.</p><Link className="text-link" to="/student/planner">Take a look at your week →</Link></div>}
 {items.map(n=><article className={`card workspace-notice ${n.read?"":"is-unread"}`} key={n.id}><span className="workspace-notice__icon"><Icon name={n.kind==="CLASS"?"calendar":n.kind==="FEEDBACK"?"edit":n.kind==="CERTIFICATE"?"shield":"clock"}/></span><div><span className="eyebrow">{n.kind.toLowerCase()}</span><h2><Link to={n.path}>{n.title}</Link></h2><p>{n.detail}</p><time className="text-muted">{new Date(n.occurredAt).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</time>{!n.read&&<button className="text-link workspace-read" disabled={read.isPending} onClick={()=>read.mutate([n.id])}>Mark as read</button>}</div></article>)}<p className="text-muted workspace-small">Shows upcoming reminders and the latest 100 updates from the last 90 days.</p></section><ReminderSettings/></div></>;
}
export function StudentWorkspacePage(){const {pathname}=useLocation();return <div className="student-shell"><header className="student-topbar"><div className="container student-topbar__inner"><Link className="student-topbar__brand" to="/student">Bukiva Learn<span>Learning space</span></Link><ThemeToggle/></div></header><StudentTools/><main className="container student-page">{pathname.endsWith("notifications")?<Notifications/>:<Planner/>}</main></div>;}
