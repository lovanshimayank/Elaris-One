import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-shell">
        {/* Left branding panel */}
        <section className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              <span>E</span>
            </div>

            <div className="auth-brand-name">Elaris-One</div>

            <div className="auth-brand-line" />

            <h1>
              Your campus.
              <br />
              <span>Intelligently connected.</span>
            </h1>

            <p>
              One platform for your notes, previous year papers,
              opportunities, academic resources and AI-powered
              campus intelligence.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span>✦</span>
                <div>
                  <strong>Campus Intelligence</strong>
                  <small>Everything important, in one place.</small>
                </div>
              </div>

              <div className="auth-feature">
                <span>✦</span>
                <div>
                  <strong>Elaris AI</strong>
                  <small>Your intelligent academic companion.</small>
                </div>
              </div>

              <div className="auth-feature">
                <span>✦</span>
                <div>
                  <strong>Opportunities</strong>
                  <small>Discover what comes next.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Elaris-One · Campus Intelligence Platform
          </div>
        </section>

        {/* Login panel */}
        <section className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-mobile-logo">
              <div className="auth-brand-logo">
                <span>E</span>
              </div>
              <span>Elaris-One</span>
            </div>

            <div className="auth-heading">
              <div className="auth-welcome-badge">
                <Sparkles size={14} />
                Welcome back
              </div>

              <h2>Sign in to Elaris</h2>

              <p>
                Access your personalized campus intelligence dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email">Email address</label>

                <div className="auth-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>
                </div>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing in..." : "Sign in"}
                </span>

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-register">
              <span>Don't have an account?</span>

              <Link to="/register">
                Create account
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="auth-security">
              <LockKeyhole size={14} />
              <span>Your session is securely protected.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}