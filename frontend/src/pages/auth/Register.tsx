import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  UserPlus,
  Hash,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    enrollmentNumber: "",
    fullName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-shell auth-register-shell">

        {/* =================================================
            BRAND PANEL
        ================================================= */}

        <section className="auth-brand-panel">
          <div className="auth-brand-content">

            <div className="auth-brand-logo">
              <span>E</span>
            </div>

            <div className="auth-brand-name">
              Elaris-One
            </div>

            <div className="auth-brand-line" />

            <h1>
              Build your
              <br />
              <span>campus identity.</span>
            </h1>

            <p>
              Create your Elaris-One account and bring your
              academic resources, opportunities and campus
              intelligence together in one place.
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">
                <span>✦</span>
                <div>
                  <strong>Personalized Dashboard</strong>
                  <small>
                    Your academic world at a glance.
                  </small>
                </div>
              </div>

              <div className="auth-feature">
                <span>✦</span>
                <div>
                  <strong>Academic Resources</strong>
                  <small>
                    Notes, PYQs and useful study material.
                  </small>
                </div>
              </div>

              <div className="auth-feature">
                <span>✦</span>
                <div>
                  <strong>Campus Opportunities</strong>
                  <small>
                    Discover internships, jobs and events.
                  </small>
                </div>
              </div>

            </div>
          </div>

          <div className="auth-brand-footer">
            Elaris-One · Campus Intelligence Platform
          </div>
        </section>

        {/* =================================================
            REGISTER PANEL
        ================================================= */}

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
                <UserPlus size={14} />
                Get started
              </div>

              <h2>Create your account</h2>

              <p>
                Join Elaris-One and start building your
                personalized campus experience.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              {error && (
                <div className="auth-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Full Name */}

              <div className="auth-field">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="auth-input-wrapper">
                  <UserRound size={18} />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Mayank Lovanshi"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Enrollment */}

              <div className="auth-field">
                <label htmlFor="enrollmentNumber">
                  Enrollment Number
                </label>

                <div className="auth-input-wrapper">
                  <Hash size={18} />

                  <input
                    id="enrollmentNumber"
                    name="enrollmentNumber"
                    type="text"
                    placeholder="Enter enrollment number"
                    value={form.enrollmentNumber}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Email */}

              <div className="auth-field">
                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="auth-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}

              <div className="auth-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={6}
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
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

                <div className="auth-password-hint">
                  <LockKeyhole size={12} />
                  Minimum 6 characters
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </span>

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>

            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-register">
              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="auth-security">
              <LockKeyhole size={14} />
              <span>
                Your account is securely protected.
              </span>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}