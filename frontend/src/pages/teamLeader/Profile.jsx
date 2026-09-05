
import { useEffect, useState } from "react";
import "./teamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("Login session not found.");
        }

        const response = await fetch(
          `${API}/users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        console.log(
          "TEAM LEADER PROFILE RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load profile"
          );
        }

        // Support different backend response formats
        const profile =
          data?.user ||
          data?.data?.user ||
          data?.data ||
          null;

        if (!profile) {
          throw new Error(
            "User information not found."
          );
        }

        setUser(profile);

        // Keep localStorage user updated
        localStorage.setItem(
          "user",
          JSON.stringify(profile)
        );

      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="tl-page">
        <div className="tl-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !user) {
    return (
      <div className="tl-page">

        <div className="tl-page-header">
          <div>
            <h1>My Profile</h1>
            <p>
              Your account information.
            </p>
          </div>
        </div>

        <div className="tl-error">
          {error ||
            "User information not found."}
        </div>

      </div>
    );
  }

  // ========================================
  // HELPERS
  // ========================================

  const firstLetter =
    user?.name
      ?.charAt(0)
      ?.toUpperCase() || "T";

  const fullAddress = [
    user?.address,
    user?.city,
    user?.district,
    user?.state,
    user?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="tl-page">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="tl-page-header">

        <div>
          <h1>My Profile</h1>

          <p>
            Your Team Leader account
            information.
          </p>
        </div>

        <div className="tl-role-badge">
          TEAM LEADER
        </div>

      </div>


      {/* ==================================
          PROFILE CARD
      ================================== */}

      <div className="tl-profile-card">

        {/* AVATAR */}

        <div className="tl-profile-avatar">
          {firstLetter}
        </div>


        {/* NAME */}

        <h2>
          {user?.name || "Team Leader"}
        </h2>


        {/* ROLE */}

        <span className="role-badge">
          {user?.role || "TEAM_LEADER"}
        </span>


        {/* ==================================
            PROFILE DETAILS
        ================================== */}

        <div className="tl-profile-grid">

          {/* EMAIL */}

          <div>
            <label>Email</label>

            <p>
              {user?.email || "-"}
            </p>
          </div>


          {/* PHONE */}

          <div>
            <label>Phone</label>

            <p>
              {user?.phone || "-"}
            </p>
          </div>


          {/* ADDRESS */}

          <div>
            <label>Address</label>

            <p>
              {user?.address || "-"}
            </p>
          </div>


          {/* CITY */}

          <div>
            <label>City</label>

            <p>
              {user?.city || "-"}
            </p>
          </div>


          {/* DISTRICT */}

          <div>
            <label>District</label>

            <p>
              {user?.district || "-"}
            </p>
          </div>


          {/* STATE */}

          <div>
            <label>State</label>

            <p>
              {user?.state || "-"}
            </p>
          </div>


          {/* PINCODE */}

          <div>
            <label>Pincode</label>

            <p>
              {user?.pincode || "-"}
            </p>
          </div>


          {/* REFERRAL CODE */}

          <div>
            <label>Referral Code</label>

            <p>
              {user?.referralCode || "-"}
            </p>
          </div>


          {/* STATUS */}

          <div>
            <label>Status</label>

            <p>
              {user?.status || "-"}
            </p>
          </div>


          {/* CATEGORY */}

          <div>
            <label>Category</label>

            <p>
              {user?.category || "-"}
            </p>
          </div>


          {/* EDUCATION */}

          <div>
            <label>Education</label>

            <p>
              {user?.education || "-"}
            </p>
          </div>


          {/* CREATED DATE */}

          <div>
            <label>Joined</label>

            <p>
              {user?.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

        </div>


        {/* ==================================
            FULL ADDRESS
        ================================== */}

        {fullAddress && (
          <div
            style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop:
                "1px solid #e5e7eb",
            }}
          >

            <label>
              Complete Address
            </label>

            <p>
              {fullAddress}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default Profile;

