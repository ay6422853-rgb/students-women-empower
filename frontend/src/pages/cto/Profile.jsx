import "./Profile.css";

function Profile() {

  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );

  return (
    <div className="cto-profile-page">

      <div className="cto-profile-header">

        <div className="cto-profile-avatar">
          {user.name?.charAt(0)?.toUpperCase() || "C"}
        </div>

        <div>

          <span>
            CHIEF TEAM OFFICER
          </span>

          <h1>
            {user.name || "CTO"}
          </h1>

          <p>
            {user.email || "Email not available"}
          </p>

        </div>

      </div>


      <div className="cto-profile-card">

        <h2>Profile Information</h2>


        <div className="profile-grid">

          <div>
            <span>Name</span>
            <strong>
              {user.name || "-"}
            </strong>
          </div>


          <div>
            <span>Email</span>
            <strong>
              {user.email || "-"}
            </strong>
          </div>


          <div>
            <span>Phone</span>
            <strong>
              {user.phone || "-"}
            </strong>
          </div>


          <div>
            <span>City</span>
            <strong>
              {user.city || "-"}
            </strong>
          </div>


          <div>
            <span>District</span>
            <strong>
              {user.district || "-"}
            </strong>
          </div>


          <div>
            <span>State</span>
            <strong>
              {user.state || "-"}
            </strong>
          </div>


          <div>
            <span>Role</span>
            <strong>
              {user.role || "CHIEF_TEAM_OFFICER"}
            </strong>
          </div>


          <div>
            <span>Status</span>
            <strong>
              {user.status || "-"}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;