import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Brand } from "../../components/Brand";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./StudentAuth.css";
export function StudentRecoveryPage() {
 const {token}=useParams();const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false);const [done,setDone]=useState(false);const [error,setError]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setError("");if(token && password!==confirm){setError("Passwords do not match.");return;}setBusy(true);
  try {await apiClient.post(token?"/api/student/auth/reset-password":"/api/student/auth/recovery",token?{token,password}:{email});setDone(true);}
  catch{setError(token?"The reset link may have expired. Request a new link and try again.":"Could not request a link. Please wait a minute and try again.");}finally{setBusy(false);}}
 return <div className="student-login"><aside className="student-login-story"><Brand/><div><span className="eyebrow">BACK TO LEARNING</span><h2>Your next chapter <span>is waiting.</span></h2><p>Recover your access with a secure, one-time password link.</p></div></aside><div className="student-login-form-area"><div className="student-login-theme"><ThemeToggle/></div><form className="student-login__card" onSubmit={submit}><h1>{token?"Choose a new password":"Recover your account"}</h1>
 {done?<p role="status">{token?"Password updated. Sign in with your new password.":"If an eligible account exists, a password link has been sent. Check your inbox and spam folder."}</p>:<><p className="text-muted">{token?"Use at least eight characters.":"Use the email address from your registration. This also renews access when your invitation has expired."}</p>
 {token?<><label className="form-field">New password<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="form-field">Confirm password<input type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label></>:<label className="form-field">Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
 {error&&<p className="form-error" role="alert">{error}</p>}<button className="btn btn-primary student-login__submit" disabled={busy}>{busy?"Please wait…":token?"Update password":"Send recovery link"}</button></>}
 {token&&<Link className="student-login__back" to="/student/recover">Request a new link</Link>}<Link className="student-login__back" to="/student/login">Back to sign in</Link></form></div></div>;
}
