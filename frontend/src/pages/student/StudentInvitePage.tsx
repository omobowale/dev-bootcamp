import { Brand } from "../../components/Brand";
import { Icon } from "../../components/Icon";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useStudentAuth } from "../../context/StudentAuthContext";
import "./StudentAuth.css";

export function StudentInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { acceptInvite, isAuthenticated } = useStudentAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/student" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvite(token ?? "", password);
      navigate("/student");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError(err.response.data?.message ?? "This invite link is invalid or has expired.");
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
          <span className="eyebrow">ALMOST THERE</span>
          <h2>
            One step from
            <br />
            your <span>first class.</span>
          </h2>
          <p>
            Set a password for your student portal account.
            <br />
            You'll use it to sign in from now on.
          </p>
        </div>
        <small>DevTraining · Student portal</small>
      </aside>
      <div className="student-login-form-area">
        <div className="student-login-theme">
          <ThemeToggle />
        </div>
        <form className="card student-login__card" onSubmit={handleSubmit}>
          <span className="student-login-lock">
            <Icon name="shield" size={25} />
          </span>
          <span className="eyebrow">SET YOUR PASSWORD</span>
          <h1 className="student-login__title">Welcome to DevTraining.</h1>
          <p className="text-muted student-login__subtitle">Choose a password to activate your account.</p>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="password">New password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
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
            <span className="text-muted student-login__hint">At least 8 characters.</span>
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className="btn btn-primary student-login__submit" disabled={submitting}>
            {submitting ? "Setting password…" : "Set password & sign in"}
          </button>
          <Link to="/" className="student-login__back">
            Back to DevTraining
          </Link>
        </form>
      </div>
    </div>
  );
}
