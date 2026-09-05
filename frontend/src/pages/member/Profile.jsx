import "./Profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function MemberProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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
      console.error(error);

      localStorage.clear();
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     REFERRAL LINK
  ====================================================== */

  function getReferralLink() {
    if (!user?.referralCode) {
      return "";
    }

    return `${window.location.origin}/register?ref=${encodeURIComponent(
      user.referralCode
    )}`;
  }

  /* =====================================================
     COPY REFERRAL CODE
  ====================================================== */

  async function copyReferralCode() {
    if (!user?.referralCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        user.referralCode
      );

      setCopyMessage("Referral code copied!");

      setTimeout(() => {
        setCopyMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);
      setCopyMessage("Unable to copy referral code");
    }
  }

  /* =====================================================
     COPY REFERRAL LINK
  ====================================================== */

  async function copyReferralLink() {
    const link = getReferralLink();

    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link);

      setCopyMessage("Referral link copied!");

      setTimeout(() => {
        setCopyMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);
      setCopyMessage("Unable to copy referral link");
    }
  }

  /* =====================================================
     SHARE REFERRAL LINK
  ====================================================== */

  async function shareReferralLink() {
    const link = getReferralLink();

    if (!link) {
      return;
    }

    const shareText =
      `Join Empower through my referral link.\n\n${link}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Empower",
          text: "Join Empower through my referral link.",
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(shareText);

        setCopyMessage(
          "Referral link copied. You can share it now!"
        );

        setTimeout(() => {
          setCopyMessage("");
        }, 2500);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(error);
      }
    }
  }

  /* =====================================================
     WHATSAPP SHARE
  ====================================================== */

  function shareOnWhatsApp() {
    const link = getReferralLink();

    if (!link) {
      return;
    }

    const message = encodeURIComponent(
      `Join Empower through my referral link:\n\n${link}`
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const referralLink = getReferralLink();

  return (
    <div>

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">

        <div>
          <h1>My Profile</h1>

          <p>
            View your account information
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/dashboard/member")
          }
        >
          Back to Dashboard
        </button>

      </div>


      {/* =====================================================
          PROFILE HEADER
      ====================================================== */}

      <div className="dashboard-card profile-header-card">

        <div className="profile-avatar">
          {user.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="profile-main-info">

          <h2>
            {user.name}
          </h2>

          <p>
            {user.email}
          </p>

          <span className="role-badge">
            {user.role?.replaceAll("_", " ")}
          </span>

        </div>

      </div>


      {/* =====================================================
          PERSONAL INFORMATION
      ====================================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              Personal Information
            </h2>

            <p>
              Your registered personal details
            </p>

          </div>

        </div>


        <div className="profile-details-grid">

          <InfoItem
            label="Full Name"
            value={user.name}
          />

          <InfoItem
            label="Email Address"
            value={user.email}
          />

          <InfoItem
            label="Phone Number"
            value={user.phone || "-"}
          />

          <InfoItem
            label="Address"
            value={user.address || "-"}
          />

          <InfoItem
            label="City"
            value={user.city || "-"}
          />

          <InfoItem
            label="District"
            value={user.district || "-"}
          />

          <InfoItem
            label="State"
            value={user.state || "-"}
          />

          <InfoItem
            label="Pincode"
            value={user.pincode || "-"}
          />

        </div>

      </div>


      {/* =====================================================
          ACCOUNT INFORMATION
      ====================================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              Account Information
            </h2>

            <p>
              Your Empower account details
            </p>

          </div>

        </div>


        <div className="profile-details-grid">

          <InfoItem
            label="User ID"
            value={user._id || user.id || "-"}
          />

          <InfoItem
            label="Role"
            value={
              user.role
                ? user.role.replaceAll("_", " ")
                : "-"
            }
          />

          <InfoItem
            label="Account Status"
            value={user.status || "-"}
          />

          <InfoItem
            label="Referral Code"
            value={user.referralCode || "-"}
          />

          <InfoItem
            label="Referred By"
            value={user.referredBy || "-"}
          />

          <InfoItem
            label="Joined"
            value={
              user.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString("en-IN")
                : "-"
            }
          />

        </div>

      </div>


      {/* =====================================================
          REFERRAL INFORMATION
      ====================================================== */}

      <div className="dashboard-card referral-profile-card">

        <div className="card-header">

          <div>

            <h2>
              Referral Information
            </h2>

            <p>
              Invite new members and grow your network
            </p>

          </div>

          <div className="referral-header-icon">
            🤝
          </div>

        </div>


        {/* =================================================
            REFERRAL CODE
        ================================================== */}

        <div className="profile-referral-code-box">

          <div className="referral-code-content">

            <span>
              Your Referral Code
            </span>

            <strong>
              {user.referralCode || "Not assigned"}
            </strong>

          </div>

          <button
            className="referral-copy-code-button"
            onClick={copyReferralCode}
            disabled={!user.referralCode}
          >
            Copy Code
          </button>

        </div>


        {/* =================================================
            REFERRAL LINK
        ================================================== */}

        {user.referralCode && (
          <div className="profile-referral-link-section">

            <div className="profile-referral-link-label">
              <span>
                Your Referral Link
              </span>

              <small>
                Share this link to invite new members
              </small>
            </div>


            <div className="profile-referral-link-box">

              <div className="profile-referral-link-value">
                {referralLink}
              </div>

              <button
                className="referral-copy-link-button"
                onClick={copyReferralLink}
              >
                Copy Link
              </button>

            </div>


            {/* =================================================
                SHARE BUTTONS
            ================================================== */}

            <div className="profile-referral-actions">

              <button
                className="profile-share-button"
                onClick={shareReferralLink}
              >
                <span>↗</span>
                Share
              </button>

              <button
                className="profile-whatsapp-button"
                onClick={shareOnWhatsApp}
              >
                <span>◉</span>
                WhatsApp
              </button>

            </div>


            {/* =================================================
                INFO
            ================================================== */}

            <div className="profile-referral-note">

              <span>✓</span>

              <p>
                Anyone who registers through your referral
                link will have your referral code attached
                to their registration.
              </p>

            </div>

          </div>
        )}


        {/* =================================================
            COPY MESSAGE
        ================================================== */}

        {copyMessage && (
          <div className="referral-copy-message">
            <span>✓</span>
            {copyMessage}
          </div>
        )}

      </div>

    </div>
  );
}


/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({ label, value }) {

  return (
    <div className="info-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


export default MemberProfile;