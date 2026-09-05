import "./Profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function MemberProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          Authorization: `Bearer ${token}`
        }
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

  return (
    <div>

      {/* Page Header */}

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


      {/* Profile Header */}

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


      {/* Personal Information */}

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


      {/* Account Information */}

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


      {/* Referral */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              Referral Information
            </h2>

            <p>
              Use your referral code to grow your network
            </p>

          </div>

        </div>


        <div className="referral-box">

          <span>
            Your Referral Code
          </span>

          <strong>
            {user.referralCode || "Not assigned"}
          </strong>

        </div>


        <button
          className="primary-button"
          onClick={() => {

            if (!user.referralCode) {
              return;
            }

            navigator.clipboard.writeText(
              user.referralCode
            );

            alert(
              "Referral code copied successfully!"
            );

          }}
        >
          Copy Referral Code
        </button>

      </div>

    </div>
  );
}


/* =====================================
   INFO ITEM
===================================== */

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
