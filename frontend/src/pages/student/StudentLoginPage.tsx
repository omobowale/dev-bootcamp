import { Brand } from "../../components/Brand";
import { Icon } from "../../components/Icon";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useStudentAuth } from "../../context/StudentAuthContext";
import "./StudentAuth.css";

export function StudentLoginPage() {
  const { login, isAuthenticated } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const expired = sessionStorage.getItem("student-auth-expired") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/student" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      sessionStorage.removeItem("student-auth-expired");
      const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;
      navigate(from && from.startsWith("/student") && from !== "/student/login" ? from : "/student");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-login">
      <aside className="student-login-story">
        <Brand />
        <div>
          <span className="eyebrow">YOUR LEARNING, IN ONE PLACE</span>
          <h2>
            Welcome back to
            <br />
            your <span>next class.</span>
          </h2>
          <p>
            Your lessons, quizzes and progress.
            <br />
            Everything you need for this cohort.
          </p>
          <div className="student-login-story-features">
            <span>
              <Icon name="book" size={18} /> Pick up where you left off
            </span>
            <span>
              <Icon name="layers" size={18} /> Track your progress
            </span>
            <span>
              <Icon name="users" size={18} /> Learn alongside your cohort
            </span>
          </div>
        </div>
        <small>DevTraining · Student portal</small>
      </aside>
      <div className="student-login-form-area">
        <div className="student-login-theme">
          <ThemeToggle />
        </div>
        <form className="card student-login__card" onSubmit={handleSubmit}>
          <span className="student-login-lock">
            <Icon name="book" size={25} />
          </span>
          <span className="eyebrow">STUDENT PORTAL</span>
          <h1 className="student-login__title">Good to see you.</h1>
          <p className="text-muted student-login__subtitle">Sign in to access your courses.</p>

          {expired && (
            <p className="notice-panel" role="status">
              Your session expired. Sign in to continue.
            </p>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>
          <Link to="/about#contact" className="text-link">
            Trouble signing in? Contact the team
          </Link>

          <button type="submit" className="btn btn-primary student-login__submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
          <Link to="/" className="student-login__back">
            Back to DevTraining
          </Link>
        </form>
      </div>
    </div>
  );
}
