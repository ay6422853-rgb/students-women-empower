
import { useEffect, useState } from "react";
import { api } from "../../api";
import "./CTODashboard.css";

function CTODashboard() {

  const [members, setMembers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [superTeamLeaders, setSuperTeamLeaders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD CTO DATA
  // ==========================================

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {

    try {

      setLoading(true);
      setMessage("");

      const [
        membersData,
        teamLeadersData,
        superTeamLeadersData
      ] = await Promise.all([

        api("/users/cto/members"),

        api("/users/cto/team-leaders"),

        api("/users/cto/super-team-leaders")

      ]);

      setMembers(
        membersData.users || []
      );

      setTeamLeaders(
        teamLeadersData.users || []
      );

      setSuperTeamLeaders(
        superTeamLeadersData.users || []
      );

    } catch (error) {

      console.error(
        "CTO dashboard error:",
        error
      );

      setMessage(
        error.message ||
        "Unable to load CTO dashboard"
      );

    } finally {

      setLoading(false);

    }
  }


  // ==========================================
  // COUNTS
  // ==========================================

  const activeMembers =
    members.filter(
      user => user.status === "ACTIVE"
    ).length;

  const pendingMembers =
    members.filter(
      user => user.status === "PENDING"
    ).length;

  const activeTeamLeaders =
    teamLeaders.filter(
      user => user.status === "ACTIVE"
    ).length;

  const activeSuperTeamLeaders =
    superTeamLeaders.filter(
      user => user.status === "ACTIVE"
    ).length;


  // ==========================================
  // RECENT USERS
  // ==========================================

  const recentUsers = [
    ...members.map(user => ({
      ...user,
      userType: "MEMBER"
    })),

    ...teamLeaders.map(user => ({
      ...user,
      userType: "TEAM LEADER"
    })),

    ...superTeamLeaders.map(user => ({
      ...user,
      userType: "SUPER TEAM LEADER"
    }))

  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 8);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="cto-loading">

        <div className="cto-loader" />

        <p>
          Loading CTO Dashboard...
        </p>

      </div>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="cto-dashboard">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="cto-page-header">

        <div>

          <span className="cto-label">
            CHIEF TEAM OFFICER
          </span>

          <h1>
            CTO Dashboard
          </h1>

          <p>
            Manage your network, teams and
            team assignments from one place.
          </p>

        </div>

        <button
          type="button"
          className="cto-refresh-btn"
          onClick={loadDashboard}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {message && (

        <div className="cto-error">
          ⚠ {message}
        </div>

      )}


      {/* =====================================
          STAT CARDS
      ===================================== */}

      <div className="cto-stat-grid">

        {/* MEMBERS */}

        <div className="cto-stat-card">

          <div className="cto-stat-icon">
            ♟
          </div>

          <div className="cto-stat-content">

            <span>
              Total Members
            </span>

            <strong>
              {members.length}
            </strong>

            <small>
              {activeMembers} active
            </small>

          </div>

        </div>


        {/* TEAM LEADERS */}

        <div className="cto-stat-card">

          <div className="cto-stat-icon">
            ♟
          </div>

          <div className="cto-stat-content">

            <span>
              Team Leaders
            </span>

            <strong>
              {teamLeaders.length}
            </strong>

            <small>
              {activeTeamLeaders} active
            </small>

          </div>

        </div>


        {/* SUPER TEAM LEADERS */}

        <div className="cto-stat-card">

          <div className="cto-stat-icon">
            ♟
          </div>

          <div className="cto-stat-content">

            <span>
              Super Team Leaders
            </span>

            <strong>
              {superTeamLeaders.length}
            </strong>

            <small>
              {activeSuperTeamLeaders} active
            </small>

          </div>

        </div>


        {/* PENDING */}

        <div className="cto-stat-card">

          <div className="cto-stat-icon">
            ◷
          </div>

          <div className="cto-stat-content">

            <span>
              Pending Members
            </span>

            <strong>
              {pendingMembers}
            </strong>

            <small>
              Need attention
            </small>

          </div>

        </div>

      </div>


      {/* =====================================
          TEAM OVERVIEW
      ===================================== */}

      <div className="cto-section">

        <div className="cto-section-header">

          <div>

            <h2>
              Team Overview
            </h2>

            <p>
              Current network structure
            </p>

          </div>

        </div>


        <div className="cto-overview-grid">

          <div className="cto-overview-box">

            <span className="overview-number">
              {members.length}
            </span>

            <span className="overview-title">
              Members
            </span>

            <span className="overview-description">
              Users working inside teams
            </span>

          </div>


          <div className="cto-overview-box">

            <span className="overview-number">
              {teamLeaders.length}
            </span>

            <span className="overview-title">
              Team Leaders
            </span>

            <span className="overview-description">
              Managing member teams
            </span>

          </div>


          <div className="cto-overview-box">

            <span className="overview-number">
              {superTeamLeaders.length}
            </span>

            <span className="overview-title">
              Super Team Leaders
            </span>

            <span className="overview-description">
              Managing team leaders
            </span>

          </div>

        </div>

      </div>


      {/* =====================================
          RECENT USERS
      ===================================== */}

      <div className="cto-section">

        <div className="cto-section-header">

          <div>

            <h2>
              Recently Registered
            </h2>

            <p>
              Latest members and leadership
              users in the network
            </p>

          </div>

        </div>


        {recentUsers.length === 0 ? (

          <div className="cto-empty">

            <div className="empty-icon">
              ♟
            </div>

            <h3>
              No users found
            </h3>

            <p>
              No members or leaders are
              available yet.
            </p>

          </div>

        ) : (

          <div className="cto-table-wrapper">

            <table className="cto-table">

              <thead>

                <tr>

                  <th>
                    User
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Joined
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentUsers.map(user => (

                  <tr key={user._id}>

                    <td>

                      <div className="cto-user">

                        <div className="cto-avatar">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {user.name}
                          </strong>

                          <span>
                            {user.email}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td>
                      {user.phone || "-"}
                    </td>


                    <td>

                      {[
                        user.city,
                        user.district
                      ]
                        .filter(Boolean)
                        .join(", ") || "-"}

                    </td>


                    <td>

                      <span
                        className={`cto-role role-${user.userType
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {user.userType}
                      </span>

                    </td>


                    <td>

                      <span
                        className={`cto-status ${
                          user.status?.toLowerCase()
                        }`}
                      >
                        {user.status}
                      </span>

                    </td>


                    <td>

                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-IN")
                        : "-"}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================
          CTO RESPONSIBILITIES
      ===================================== */}

      <div className="cto-section">

        <div className="cto-section-header">

          <div>

            <h2>
              CTO Responsibilities
            </h2>

            <p>
              Main areas controlled by the CTO
            </p>

          </div>

        </div>


        <div className="cto-responsibility-grid">

          <div className="cto-responsibility-card">

            <span>
              ♟
            </span>

            <h3>
              Team Building
            </h3>

            <p>
              Assign members to Team Leaders
              and build the network structure.
            </p>

          </div>


          <div className="cto-responsibility-card">

            <span>
              ♟
            </span>

            <h3>
              Leadership Management
            </h3>

            <p>
              Manage Team Leaders and Super
              Team Leaders under your network.
            </p>

          </div>


          <div className="cto-responsibility-card">

            <span>
              ⇄
            </span>

            <h3>
              Selling Assignment
            </h3>

            <p>
              Assign the appropriate selling
              Team Leader to users.
            </p>

          </div>


          <div className="cto-responsibility-card">

            <span>
              ◈
            </span>

            <h3>
              Network Monitoring
            </h3>

            <p>
              Monitor the overall network and
              user activity.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}

export default CTODashboard;
