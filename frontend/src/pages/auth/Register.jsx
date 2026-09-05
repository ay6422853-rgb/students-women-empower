import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { api } from "../../api";
import "./register.css";

function Register() {
  const [searchParams] = useSearchParams();

  const referralFromUrl =
    searchParams.get("ref")?.trim() || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    password: "",
    confirmPassword: "",
    referralCode: referralFromUrl,
    aadhaarNumber: "",
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

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.district.trim() ||
      !form.state.trim() ||
      !form.pincode.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setMessage("Please fill all required fields");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/register", {
        method: "POST",

        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          password: form.password,
          referralCode: form.referralCode.trim(),
          aadhaarNumber: form.aadhaarNumber.trim(),
        }),
      });

      setMessage(
        data.message || "Registration successful!"
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      setMessage(
        error.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">

      {/* =====================================================
          TOP BRAND
      ====================================================== */}

      <div className="register-topbar">

        <Link to="/" className="register-brand">

          <div className="register-logo">
            E
          </div>

          <div className="register-brand-text">
            <strong>EMPOWER</strong>
            <span>Students & Women</span>
          </div>

        </Link>

        <div className="register-login-link">
          Already a member?
          <Link to="/">Login</Link>
        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="register-layout">

        {/* ===================================================
            LEFT INTRO
        ==================================================== */}

        <aside className="register-intro">

          <div className="intro-badge">
            <span>✦</span>
            Your journey starts here
          </div>

          <h1>
            Build your
            <br />
            <span>opportunity.</span>
          </h1>

          <p>
            Empower is built especially for students and women
            who want to explore a flexible way to learn, connect,
            sell products and build a side-income opportunity
            alongside their regular life.
          </p>


          <div className="intro-points">

            <div className="intro-point">
              <div className="intro-icon">
                🎓
              </div>

              <div>
                <strong>
                  Students First
                </strong>

                <span>
                  Build alongside your studies and career goals.
                </span>
              </div>
            </div>


            <div className="intro-point">
              <div className="intro-icon">
                🤝
              </div>

              <div>
                <strong>
                  Grow Your Refferals
                </strong>

                <span>
                  Connect with people and grow together.
                </span>
              </div>
            </div>


            <div className="intro-point">
              <div className="intro-icon">
                📈
              </div>

              <div>
                <strong>
                  Earn Through Refferal Commissions
                </strong>

                <span>
                  Eligible product sales can generate commissions.
                </span>
              </div>
            </div>

          </div>


          <div className="intro-no-fee">

            <span>✓</span>

            <div>
              <strong>
                No Joining Fee
              </strong>

              <small>
                Create your account without an entry fee.
              </small>
            </div>

          </div>

        </aside>


        {/* ===================================================
            REGISTRATION FORM
        ==================================================== */}

        <main className="register-content">

          <div className="register-form-header">

            <div className="form-step">
              STEP 1 OF 1
            </div>

            <h2>
              Create your Empower account
            </h2>

            <p>
              Enter your details to get started.
              It only takes a few minutes.
            </p>

          </div>


          <form
            className="register-card"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                PERSONAL INFORMATION
            ================================================== */}

            <section className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  01
                </div>

                <div>
                  <h3>
                    Personal Information
                  </h3>

                  <p>
                    Tell us a little about yourself.
                  </p>
                </div>

              </div>


              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="name">
                    Full Name <span>*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="email">
                    Email Address <span>*</span>
                  </label>

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


                <div className="form-group">

                  <label htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="pincode">
                    Pincode <span>*</span>
                  </label>

                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    placeholder="Enter pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength="6"
                    autoComplete="postal-code"
                  />

                </div>

              </div>


              <div className="form-group">

                <label htmlFor="address">
                  Complete Address <span>*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your complete address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  autoComplete="street-address"
                />

              </div>


              <div className="form-grid three-columns">

                <div className="form-group">

                  <label htmlFor="city">
                    City <span>*</span>
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="district">
                    District <span>*</span>
                  </label>

                  <input
                    id="district"
                    type="text"
                    name="district"
                    placeholder="District"
                    value={form.district}
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="state">
                    State <span>*</span>
                  </label>

                  <input
                    id="state"
                    type="text"
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                REFERRAL
            ================================================== */}

            <section className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  02
                </div>

                <div>
                  <h3>
                    Referral Information
                  </h3>

                  <p>
                    Join through someone you know, if applicable.
                  </p>

                </div>

              </div>


              <div
                className={`referral-box ${
                  referralFromUrl
                    ? "referral-applied"
                    : ""
                }`}
              >

                <div className="referral-icon">
                  #
                </div>

                <div className="referral-input">

                  <label htmlFor="referralCode">
                    Referral Code
                  </label>

                  <input
                    id="referralCode"
                    type="text"
                    name="referralCode"
                    placeholder="Enter referral code (optional)"
                    value={form.referralCode}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {referralFromUrl ? (
                <div className="referral-success-note">
                  ✓ Referral code <strong>{referralFromUrl}</strong> has been applied from your referral link.
                </div>
              ) : (
                <div className="optional-note">
                  Referral code is optional. You can register without one.
                </div>
              )}

            </section>


            {/* =================================================
                IDENTITY
            ================================================== */}

            <section className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  03
                </div>

                <div>
                  <h3>
                    Identity Information
                  </h3>

                  <p>
                    Additional identity information.
                  </p>
                </div>

              </div>


              <div className="form-group">

                <label htmlFor="aadhaarNumber">
                  Aadhaar Number
                </label>

                <input
                  id="aadhaarNumber"
                  type="text"
                  name="aadhaarNumber"
                  placeholder="Enter Aadhaar number (optional)"
                  value={form.aadhaarNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength="12"
                  autoComplete="off"
                />

              </div>

              <div className="optional-note">
                Aadhaar information is optional at registration.
              </div>

            </section>


            {/* =================================================
                SECURITY
            ================================================== */}

            <section className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  04
                </div>

                <div>
                  <h3>
                    Account Security
                  </h3>

                  <p>
                    Create a strong password for your account.
                  </p>

                </div>

              </div>


              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="password">
                    Password <span>*</span>
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="confirmPassword">
                    Confirm Password <span>*</span>
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                SUBMIT
            ================================================== */}

            <div className="register-submit-area">

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Creating Account..."
                    : "Create My Empower Account"}
                </span>

                {!loading && (
                  <span className="submit-arrow">
                    →
                  </span>
                )}

              </button>


              {message && (
                <div className="register-message">
                  <span>!</span>
                  {message}
                </div>
              )}


              <div className="terms-note">
                By creating an account, you agree to use the
                platform responsibly and follow Empower's terms
                and policies.
              </div>

            </div>


            {/* =================================================
                LOGIN
            ================================================== */}

            <div className="already-account">

              <span>
                Already have an account?
              </span>

              <Link to="/">
                Login to Empower
                <span>→</span>
              </Link>

            </div>

          </form>

        </main>

      </div>

    </div>
  );
}

export default Register;