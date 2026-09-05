import "./MemberDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function MemberDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const data = await api("/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data.user);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
    } catch (error) {
      console.error("Member dashboard error:", error);

      localStorage.clear();
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  function formatRole(role) {
    if (!role) return "Member";

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function getReferralLink() {
    if (!user?.referralCode) return "";

    const baseUrl = window.location.origin;

    return `${baseUrl}/register?ref=${encodeURIComponent(
      user.referralCode
    )}`;
  }

  async function copyReferralCode() {
    if (!user?.referralCode) return;

    try {
      await navigator.clipboard.writeText(
        user.referralCode
      );

      alert("Referral code copied!");
    } catch {
      alert("Unable to copy referral code.");
    }
  }

  async function copyReferralLink() {
    const referralLink = getReferralLink();

    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(
        referralLink
      );

      alert("Referral link copied!");
    } catch {
      alert("Unable to copy referral link.");
    }
  }

  async function shareReferralLink() {
    const referralLink = getReferralLink();

    if (!referralLink) return;

    const shareText = `Join Empower Network using my referral link.\n\n${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Empower Network",
          text: "Join Empower Network using my referral link.",
          url: referralLink,
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error(
            "Share error:",
            error
          );
        }
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(
        shareText
      );

      alert(
        "Referral link copied! You can now share it anywhere."
      );
    } catch {
      alert(
        "Unable to share referral link."
      );
    }
  }

  function shareOnWhatsApp() {
    const referralLink = getReferralLink();

    if (!referralLink) return;

    const message =
      `Join Empower Network using my referral link:\n\n${referralLink}`;

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="member-page">

      {/* HEADER */}

      <div className="page-header">
        <div className="page-header-content">
          <span className="welcome-label">
            MEMBER DASHBOARD
          </span>

          <h1>
            Welcome, {user.name || "Member"} 👋
          </h1>

          <p>
            Manage your orders, network, referrals and earnings
            from one place.
          </p>
        </div>

        <div className="header-status">
          <span className="account-status">
            <span className="status-dot"></span>
            {user.status || "ACTIVE"}
          </span>
        </div>
      </div>


      {/* MEMBER OVERVIEW */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            👤
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Account Status
            </span>

            <h2>
              {user.status || "ACTIVE"}
            </h2>

            <small>
              Your account is currently active
            </small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            🔗
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Referral Code
            </span>

            <h2 className="referral-code-value">
              {user.referralCode || "-"}
            </h2>

            <button
              type="button"
              className="copy-code-button"
              onClick={copyReferralCode}
            >
              Copy Code
            </button>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            ⭐
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Membership
            </span>

            <h2>
              {formatRole(user.role)}
            </h2>

            <small>
              Empower Network Member
            </small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            📍
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Location
            </span>

            <h2>
              {user.city || user.district || "-"}
            </h2>

            <small>
              {user.state || "India"}
            </small>
          </div>
        </div>

      </div>


      {/* =====================================================
          REFERRAL BANNER
      ===================================================== */}

      <div className="referral-banner">

        <div className="referral-banner-icon">
          🔗
        </div>

        <div className="referral-banner-content">

          <span>
            BUILD YOUR NETWORK
          </span>

          <h2>
            Invite people and grow your network
          </h2>

          <p>
            Share your referral link with friends,
            family and people who want to join Empower.
          </p>

        </div>


        <div className="referral-banner-action">

          <div className="referral-code-box">
            <span>
              Your Referral Code
            </span>

            <strong>
              {user.referralCode || "-"}
            </strong>
          </div>


          <div className="referral-link-box">

            <span>
              Your Referral Link
            </span>

            <div className="referral-link-value">
              {user.referralCode
                ? getReferralLink()
                : "-"}
            </div>

          </div>


          <div className="referral-buttons">

            <button
              type="button"
              onClick={copyReferralLink}
              className="secondary-button referral-action-button"
            >
              📋 Copy Link
            </button>


            <button
              type="button"
              onClick={shareReferralLink}
              className="primary-button referral-action-button"
            >
              📤 Share
            </button>


            <button
              type="button"
              onClick={shareOnWhatsApp}
              className="whatsapp-button referral-action-button"
            >
              💬 WhatsApp
            </button>

          </div>

        </div>

      </div>


      {/* QUICK ACTIONS */}

      <div className="section-title">
        <div>
          <span className="section-label">
            QUICK ACCESS
          </span>

          <h2>
            What would you like to do?
          </h2>

          <p>
            Access your most important Member features.
          </p>
        </div>
      </div>


      <div className="quick-actions">

        <button
          className="action-card"
          onClick={() =>
            navigate("/dashboard/member/products")
          }
        >
          <span className="action-icon">
            🛍️
          </span>

          <strong>
            Shop Products
          </strong>

          <small>
            Browse and purchase products
          </small>

          <span className="action-arrow">
            →
          </span>
        </button>


        <button
          className="action-card"
          onClick={() =>
            navigate("/dashboard/member/orders")
          }
        >
          <span className="action-icon">
            📦
          </span>

          <strong>
            My Orders
          </strong>

          <small>
            Track your orders and purchases
          </small>

          <span className="action-arrow">
            →
          </span>
        </button>


        <button
          className="action-card"
          onClick={() =>
            navigate("/dashboard/member/my-network")
          }
        >
          <span className="action-icon">
            👥
          </span>

          <strong>
            My Network
          </strong>

          <small>
            View referrals and network members
          </small>

          <span className="action-arrow">
            →
          </span>
        </button>


        <button
          className="action-card"
          onClick={() =>
            navigate("/dashboard/member/wallet")
          }
        >
          <span className="action-icon">
            💰
          </span>

          <strong>
            Commission Wallet
          </strong>

          <small>
            View earnings and withdrawals
          </small>

          <span className="action-arrow">
            →
          </span>
        </button>

      </div>


      {/* MEMBER JOURNEY */}

      <div className="dashboard-card">

        <div className="card-header">
          <div>
            <span className="section-label">
              MEMBER JOURNEY
            </span>

            <h2>
              How Empower Works
            </h2>

            <p>
              Follow these simple steps to grow with Empower.
            </p>
          </div>
        </div>


        <div className="workflow">

          <div className="workflow-item">
            <div className="workflow-number">
              01
            </div>

            <div className="workflow-content">
              <strong>
                Create Your Network
              </strong>

              <p>
                Share your referral link and invite people
                to become part of your network.
              </p>
            </div>
          </div>


          <div className="workflow-item">
            <div className="workflow-number">
              02
            </div>

            <div className="workflow-content">
              <strong>
                Purchase Products
              </strong>

              <p>
                Browse available products and place orders
                through your selected Team Leader.
              </p>
            </div>
          </div>


          <div className="workflow-item">
            <div className="workflow-number">
              03
            </div>

            <div className="workflow-content">
              <strong>
                Grow Your Network
              </strong>

              <p>
                Build your direct referral network and track
                your network activity.
              </p>
            </div>
          </div>


          <div className="workflow-item">
            <div className="workflow-number">
              04
            </div>

            <div className="workflow-content">
              <strong>
                Earn Commission
              </strong>

              <p>
                Eligible sales in your network can generate
                commission according to the applicable levels.
              </p>
            </div>
          </div>

        </div>

      </div>


      {/* ACCOUNT INFORMATION */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <span className="section-label">
              ACCOUNT
            </span>

            <h2>
              Account Information
            </h2>

            <p>
              Your current Empower member information.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/dashboard/member/profile")
            }
          >
            View Profile
          </button>

        </div>


        <div className="profile-details-grid">

          <div className="info-item">
            <span>
              Full Name
            </span>

            <strong>
              {user.name || "-"}
            </strong>
          </div>


          <div className="info-item">
            <span>
              Email
            </span>

            <strong>
              {user.email || "-"}
            </strong>
          </div>


          <div className="info-item">
            <span>
              Phone
            </span>

            <strong>
              {user.phone || "-"}
            </strong>
          </div>


          <div className="info-item">
            <span>
              Referral Code
            </span>

            <strong>
              {user.referralCode || "-"}
            </strong>
          </div>


          <div className="info-item">
            <span>
              District
            </span>

            <strong>
              {user.district || "-"}
            </strong>
          </div>


          <div className="info-item">
            <span>
              State
            </span>

            <strong>
              {user.state || "-"}
            </strong>
          </div>


          <div className="info-item">
            <span>
              Pincode
            </span>

            <strong>
              {user.pincode || "-"}
            </strong>
          </div>


          <div className="info-item">
            <span>
              Role
            </span>

            <strong>
              {formatRole(user.role)}
            </strong>
          </div>

        </div>

      </div>


      {/* BOTTOM ACTIONS */}

      <div className="bottom-actions">

        <button
          className="bottom-action-card"
          onClick={() =>
            navigate("/dashboard/member/profile")
          }
        >
          <span>
            👤
          </span>

          <div>
            <strong>
              My Profile
            </strong>

            <small>
              Update your account information
            </small>
          </div>

          <b>
            →
          </b>
        </button>


        <button
          className="bottom-action-card"
          onClick={() =>
            navigate("/dashboard/member/my-network")
          }
        >
          <span>
            👥
          </span>

          <div>
            <strong>
              My Network
            </strong>

            <small>
              Manage your referral network
            </small>
          </div>

          <b>
            →
          </b>
        </button>


        <button
          className="bottom-action-card"
          onClick={() =>
            navigate("/dashboard/member/wallet")
          }
        >
          <span>
            💰
          </span>

          <div>
            <strong>
              Commission Wallet
            </strong>

            <small>
              Check your commission balance
            </small>
          </div>

          <b>
            →
          </b>
        </button>

      </div>


      {/* FOOTER */}

      <div className="dashboard-footer">

        <p>
          Empower Network
        </p>

        <span>
          Build • Connect • Grow
        </span>

      </div>

    </div>
  );
}

export default MemberDashboard;