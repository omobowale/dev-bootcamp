import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Select } from "../../components/Select";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { SubmissionCard } from "./AdminAssignmentSubmissionsPage";
import type { AdminSubmission } from "../../types/admin";
import "./adminShared.css";
type Queue={content:{assignmentId:number;assignmentTitle:string;courseTitle:string;dueAt:string|null;submission:AdminSubmission}[];totalPages:number;totalElements:number};
export function AdminGradingPage(){const [status,setStatus]=useState("SUBMITTED");const [search,setSearch]=useState("");const [page,setPage]=useState(0);
 const q=useQuery({queryKey:["admin","grading",status,search,page],queryFn:async()=>(await apiClient.get<Queue>("/api/admin/grading",{params:{status,search,page}})).data});
 return <div className="container admin-page"><div className="admin-page__header"><div><span className="eyebrow">ASSESSMENT WORKSPACE</span><h1>Grading queue</h1><p className="text-muted">Review learner work across every course. Oldest submissions appear first.</p></div></div><div className="admin-filters"><input aria-label="Search grading queue" placeholder="Search student, course or assignment" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/><Select aria-label="Submission status" value={status} onChange={e=>{setStatus(e.target.value);setPage(0);}}><option value="">All statuses</option>{["SUBMITTED","UNDER_REVIEW","REVIEWED","NEEDS_RESUBMISSION"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</Select></div>
 {q.isLoading&&<LoadingState/>}{q.isError&&<ErrorState onRetry={()=>q.refetch()}/>}<p className="text-muted">{q.data?.totalElements??0} matching submissions</p>{q.data?.content.map(row=><section key={`${row.submission.id}-${row.submission.version}`}><span className="eyebrow">{row.courseTitle}</span><h2>{row.assignmentTitle}</h2>{row.dueAt&&<p className="text-muted">Due {new Date(row.dueAt).toLocaleDateString()}</p>}<SubmissionCard submission={row.submission} assignmentId={row.assignmentId}/></section>)}<div className="admin-actions-row"><button className="btn btn-secondary" disabled={page===0} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page+1} of {Math.max(1,q.data?.totalPages??1)}</span><button className="btn btn-secondary" disabled={!q.data||page+1>=q.data.totalPages} onClick={()=>setPage(page+1)}>Next</button></div></div>;}
