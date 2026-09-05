import { useEffect, useState } from "react";
import "./SuperTeamLeader.css";

function Profile() {

  const [user, setUser] = useState({});

  useEffect(() => {

    try {

      const data =
        JSON.parse(
          localStorage.getItem("user")
        );

      setUser(data || {});

    } catch {
      setUser({});
    }

  }, []);


  return (
    <div className="stl-page">

      <div className="stl-header">

        <div>
          <h1>My Profile</h1>
          <p>
            View your account information.
          </p>
        </div>

      </div>


      <div className="stl-profile-card">

        <div className="stl-avatar">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <h2>
          {user.name || "User"}
        </h2>

        <span className="stl-role">
          {user.role || "SUPER_TEAM_LEADER"}
        </span>

        <div className="stl-profile-info">

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
