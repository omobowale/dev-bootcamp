import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizAttemptResult } from "../../api/student/quizzes";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { sanitizeRichText } from "../../utils/richText";
import "./StudentDashboardPage.css";
export function StudentQuizResultPage(){const {attemptId}=useParams();const q=useQuery({queryKey:["student","quiz-result",attemptId],queryFn:()=>getQuizAttemptResult(Number(attemptId))});
 return <div className="student-shell"><div className="container student-page"><Link className="text-link" to="/student">My courses</Link>{q.isLoading&&<LoadingState/>}{q.isError&&<ErrorState onRetry={()=>q.refetch()}/>}<div className="student-page__header"><span className="eyebrow">YOUR RESULTS</span><h1>{q.data?`${Math.round(q.data.percentage)}% · ${q.data.passed?"Passed":"Keep practising"}`:"Quiz result"}</h1></div>{q.data?.answers.map((a,i)=><article className="card student-class-card" key={a.questionId}><h3>{i+1}. {a.text}</h3><p className={a.correct?"quiz-result-correct":"quiz-result-incorrect"}>{a.correct?"Correct":"Incorrect"}</p><ul className="quiz-review-options">{a.options.map((o,n)=><li key={n} className={o.correct?"quiz-review-options__correct":n===a.selectedOptionPosition?"quiz-review-options__wrong-pick":""}>{o.text}{o.correct?" (correct answer)":n===a.selectedOptionPosition?" (your answer)":""}</li>)}</ul>{a.explanation&&<div className="rich-content" dangerouslySetInnerHTML={{__html:sanitizeRichText(a.explanation)}}/>}</article>)}</div></div>;}
