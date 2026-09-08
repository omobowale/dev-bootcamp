import { RubricBreakdown,type RubricMark } from "./AssignmentRubric";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { formatDateTime } from "../utils/formatDate";
import { safeUrl } from "../utils/links";
type Revision={rubricBreakdown?:RubricMark[];archivedAt:string;responseText:string;score:number|null;feedback:string;attachmentUrl:string};
export function SubmissionHistory({url}:{url:string}) {const [open,setOpen]=useState(false);const q=useQuery({queryKey:["submission-history",url],queryFn:async()=>(await apiClient.get<Revision[]>(url)).data,enabled:open});
 return <div style={{marginTop:20}}><button type="button" className="btn btn-secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?"Hide":"View"} previous submissions</button>{open&&<div>{q.isLoading&&<p>Loading history…</p>}{q.isError&&<button type="button" onClick={()=>q.refetch()}>Could not load history. Retry</button>}{q.data?.length===0&&<p className="text-muted">No previous revisions.</p>}{q.data?.map((r,i)=><article className="notice-panel" key={i}><strong>{formatDateTime(r.archivedAt)}</strong><p style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{r.responseText}</p>{r.score!==null&&<p>Previous score: {r.score}</p>}{r.feedback&&<p>Feedback: {r.feedback}</p>}{r.rubricBreakdown&&<RubricBreakdown marks={r.rubricBreakdown}/>}{safeUrl(r.attachmentUrl)&&<a href={safeUrl(r.attachmentUrl)} target="_blank" rel="noreferrer">Previous attachment</a>}</article>)}</div>}</div>;}
