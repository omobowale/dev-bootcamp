import { Brand } from "../../components/Brand";
import { Icon } from "../../components/Icon";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./AdminLoginPage.css";
export function AdminLoginPage() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const expired = sessionStorage.getItem('auth-expired') === 'true';
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    if (isAuthenticated) {
        return <Navigate to="/admin" replace/>;
    }
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
            sessionStorage.removeItem("auth-expired");
            navigate(location.state?.from?.pathname?.startsWith("/admin") && location.state.from.pathname !== "/admin/login" ? location.state.from.pathname : "/admin");
        }
        catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError("Invalid email or password.");
            }
            else {
                setError("Something went wrong. Please try again.");
            }
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="admin-login">
      <aside className="login-story"><Brand /><div><span className="eyebrow">THE WORK BEHIND THE POSSIBILITY</span><h2>Build the place<br />where great<br /><span>learning happens.</span></h2><p>Your courses. Your cohorts. Your community.<br />One thoughtful workspace to bring it all together.</p><div className="login-story-features"><span><Icon name="book" size={18} /> Shape the curriculum</span><span><Icon name="users" size={18} /> Connect with learners</span><span><Icon name="layers" size={18} /> Keep everything in focus</span></div></div><small>Bukiva Learn · Admin workspace</small></aside>
      <div className="login-form-area"><div className="login-theme"><ThemeToggle /></div>
      <form className="card admin-login__card" onSubmit={handleSubmit}>
        <span className="login-lock"><Icon name="shield" size={25} /></span><span className="eyebrow">ADMIN WORKSPACE</span><h1 className="admin-login__title">Good to see you again.</h1>
        <p className="text-muted admin-login__subtitle">Sign in to manage courses, cohorts and registrations.</p>

        {expired && <p className="notice-panel" role="status">Your session expired. Sign in to continue.</p>}
        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting}/>
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <div className="password-field"><input id="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting}/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}><Icon name="eye" size={18} /></button></div>
        </div>
        <Link to="/about#contact" className="text-link">Need access? Contact the team</Link>

        <button type="submit" className="btn btn-primary admin-login__submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      <Link to="/" className="admin-login__back">Back to Bukiva Learn</Link></form></div>
    </div>);
}
