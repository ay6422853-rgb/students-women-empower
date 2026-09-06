import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./login.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");

    if (!form.email.trim() || !form.password) {
      setMessage("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* =====================================================
            LEFT - EMPOWER INTRO
        ====================================================== */}

        <div className="auth-info">

          <div className="auth-brand">
            <div className="auth-logo">E</div>

            <div className="auth-brand-name">
              <strong>EMPOWER</strong>
              <span>Students & Women</span>
            </div>
          </div>

          <div className="mobile-auth-nav">
            <button
              type="button"
              className="mobile-auth-login active"
              onClick={() => {
                document
                  .querySelector(".auth-form-wrapper")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
            >
              Login
            </button>

            <button
              type="button"
              className="mobile-auth-register"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>

          <div className="auth-info-content">

            <div className="auth-eyebrow">
              <span>✦</span>
              Built for the next generation
            </div>

            <h1>
              Empower Your
              <br />
              <span>Future.</span>
            </h1>

            <p className="auth-main-description">
              A platform created especially for students and women
              who want to explore a flexible side-income opportunity
              alongside their studies, daily life and career goals.
            </p>

            <div className="auth-highlight">
              <div className="auth-highlight-icon">
                ↗
              </div>

              <div>
                <strong>
                  Your studies come first.
                </strong>

                <p>
                  Use your available time to learn, connect,
                  sell products and build your own network.
                </p>
              </div>
            </div>

            <div className="auth-features">

              <div className="auth-feature">
                <span>✓</span>
                <div>
                  <strong>Study Alongside</strong>
                  <small>Build your opportunity without leaving your studies</small>
                </div>
              </div>

              <div className="auth-feature">
                <span>✓</span>
                <div>
                  <strong>Build Your Refferals</strong>
                  <small>Connect with people and grow together</small>
                </div>
              </div>

              <div className="auth-feature">
                <span>✓</span>
                <div>
                  <strong>Earn Through Refferal Commissions</strong>
                  <small>Earn commissions from eligible product sales</small>
                </div>
              </div>

              <div className="auth-feature">
                <span>✓</span>
                <div>
                  <strong>Your Time, Your Growth</strong>
                  <small>Work flexibly according to your schedule</small>
                </div>
              </div>

            </div>

            <div className="no-joining-fee">
              <span>✓</span>
              <strong>No Joining Fee</strong>
              <small>Start without an entry fee</small>
            </div>

          </div>

          <div className="auth-footer-text">
            Learn • Connect • Sell • Grow
          </div>

        </div>


        {/* =====================================================
            RIGHT - LOGIN FORM
        ====================================================== */}

        <div className="auth-form-wrapper">

          <div className="auth-card">

            <div className="mobile-brand">
              <div className="mobile-logo">E</div>

              <div>
                <strong>EMPOWER</strong>
                <span>Students & Women</span>
              </div>
            </div>

            <div className="auth-welcome">
              <span className="welcome-badge">
                Welcome back
              </span>

              <h2>
                Let's continue
                <br />
                <span>your journey.</span>
              </h2>

              <p className="auth-subtitle">
                Login to your Empower account and continue
                building your network and opportunity.
              </p>
            </div>


            {/* LOGIN FORM */}

            <form onSubmit={handleSubmit}>

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />

                </div>

              </div>


              <div className="form-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    •••
                  </span>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                </div>

              </div>


              <div className="form-options">

                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="remember"
                  />

                  <span>
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {
                    setMessage(
                      "Password recovery will be available soon."
                    );
                  }}
                >
                  Forgot Password?
                </button>

              </div>


              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Logging in..."
                    : "Login to Empower"}
                </span>

                {!loading && (
                  <span className="button-arrow">
                    →
                  </span>
                )}

              </button>


              {message && (
                <div className="auth-message">
                  <span>!</span>
                  {message}
                </div>
              )}

            </form>


            {/* DIVIDER */}

            <div className="auth-divider">
              <span>OR</span>
            </div>


            {/* REGISTER */}

            <div className="register-box">

              <p>
                New to Empower?
              </p>

              <Link to="/register">
                Create Your Free Account
                <span>→</span>
              </Link>

            </div>


            <div className="login-note">
              <span>🔒</span>
              Your account information is securely protected.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;
