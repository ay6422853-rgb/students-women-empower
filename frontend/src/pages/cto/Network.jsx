
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import "./Network.css";

function Network() {
  const [members, setMembers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [superTeamLeaders, setSuperTeamLeaders] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNetwork();
  }, []);

  async function loadNetwork() {
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

      setMembers(membersData.users || []);
      setTeamLeaders(teamLeadersData.users || []);
      setSuperTeamLeaders(
        superTeamLeadersData.users || []
      );

    } catch (error) {
      console.error("CTO network error:", error);

      setMessage(
        error.message || "Unable to load network"
      );

    } finally {
      setLoading(false);
    }
  }


  // ==========================================
  // SEARCH
  // ==========================================

  function matchesSearch(user) {
    if (!search.trim()) {
      return true;
    }

    const text = search.toLowerCase();

    return [
      user.name,
      user.email,
      user.phone,
      user.city,
      user.district,
      user.state,
      user.pincode,
      user.role,
      user.referralCode
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(text);
  }


  const filteredMembers = useMemo(() => {
    return members.filter(matchesSearch);
  }, [members, search]);


  const filteredTeamLeaders = useMemo(() => {
    return teamLeaders.filter(matchesSearch);
  }, [teamLeaders, search]);


  const filteredSuperTeamLeaders = useMemo(() => {
    return superTeamLeaders.filter(matchesSearch);
  }, [superTeamLeaders, search]);


  // ==========================================
  // HELPERS
  // ==========================================

  function getUserName(user) {
    if (!user) {
      return "Not Assigned";
    }

    return user.name || "Unknown";
  }


  function getUserEmail(user) {
    if (!user) {
      return "";
    }

    return user.email || "";
  }


  function getRoleLabel(role) {
    if (!role) {
      return "-";
    }

    return role
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }


  function getLocation(user) {
    return [
      user.city,
      user.district,
      user.state
    ]
      .filter(Boolean)
      .join(", ") || "-";
  }


  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }


  function openUser(user, type) {
    setSelectedUser({
      ...user,
      userType: type
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  function closeDetails() {
    setSelectedUser(null);
  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="cto-network-page">
        <div className="cto-loading">
          Loading network...
        </div>
      </div>
    );
  }


  return (
    <div className="cto-network-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="cto-page-header">

        <div>
          <h1>Network</h1>

          <p>
            Manage and view your complete network
            structure.
          </p>
        </div>

        <button
          className="cto-refresh-btn"
          onClick={loadNetwork}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================
          SEARCH
      ===================================== */}

      <div className="network-search-box">

        <div className="search-icon">
          🔍
        </div>

        <input
          type="text"
          placeholder="Search by name, email, phone, city, role or referral code..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {message && (
        <div className="cto-error">
          {message}
        </div>
      )}


      {/* =====================================
          SELECTED USER DETAILS
      ===================================== */}

      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={closeDetails}
          getRoleLabel={getRoleLabel}
          getUserName={getUserName}
          getUserEmail={getUserEmail}
          getLocation={getLocation}
          formatDate={formatDate}
        />
      )}


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="network-summary">

        <div className="network-stat-card">

          <div className="network-stat-icon">
            ♟
          </div>

          <div>
            <span>Total Members</span>

            <strong>
              {members.length}
            </strong>
          </div>

        </div>


        <div className="network-stat-card">

          <div className="network-stat-icon">
            ♟
          </div>

          <div>
            <span>Team Leaders</span>

            <strong>
              {teamLeaders.length}
            </strong>
          </div>

        </div>


        <div className="network-stat-card">

          <div className="network-stat-icon">
            ♟
          </div>

          <div>
            <span>Super Team Leaders</span>

            <strong>
              {superTeamLeaders.length}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================
          MEMBERS
      ===================================== */}

      <section className="network-section">

        <div className="section-heading">

          <div>
            <h2>Members</h2>

            <p>
              Members and their current assignments.
            </p>
          </div>

          <span className="section-count">
            {filteredMembers.length}
          </span>

        </div>


        {filteredMembers.length === 0 ? (

          <div className="empty-network">
            No members found.
          </div>

        ) : (

          <div className="network-table-wrapper">

            <table className="network-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Team Leader</th>
                  <th>Selling Team Leader</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {filteredMembers.map((member) => (

                  <tr
                    key={
                      member._id ||
                      member.id
                    }
                  >

                    <td>

                      <div className="user-name">
                        {member.name}
                      </div>

                      <div className="user-email">
                        {member.email}
                      </div>

                    </td>


                    <td>
                      {member.phone || "-"}
                    </td>


                    <td>
                      {getLocation(member)}
                    </td>


                    <td>

                      {member.teamLeader ? (

                        <div className="assigned-user">

                          <strong>
                            {getUserName(
                              member.teamLeader
                            )}
                          </strong>

                          <small>
                            {getUserEmail(
                              member.teamLeader
                            )}
                          </small>

                        </div>

                      ) : (

                        <span className="not-assigned">
                          Not Assigned
                        </span>

                      )}

                    </td>


                    <td>

                      {member.sellingTeamLeader ? (

                        <div className="assigned-user">

                          <strong>
                            {getUserName(
                              member.sellingTeamLeader
                            )}
                          </strong>

                          <small>
                            {getUserEmail(
                              member.sellingTeamLeader
                            )}
                          </small>

                        </div>

                      ) : (

                        <span className="not-assigned">
                          Not Assigned
                        </span>

                      )}

                    </td>


                    <td>
                      <StatusBadge
                        status={member.status}
                      />
                    </td>


                    <td>

                      <button
                        className="view-button"
                        onClick={() =>
                          openUser(
                            member,
                            "MEMBER"
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================
          TEAM LEADERS
      ===================================== */}

      <section className="network-section">

        <div className="section-heading">

          <div>
            <h2>Team Leaders</h2>

            <p>
              Team Leaders and their assignments.
            </p>
          </div>

          <span className="section-count">
            {filteredTeamLeaders.length}
          </span>

        </div>


        {filteredTeamLeaders.length === 0 ? (

          <div className="empty-network">
            No Team Leaders found.
          </div>

        ) : (

          <div className="network-table-wrapper">

            <table className="network-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Super Team Leader</th>
                  <th>Selling Team Leader</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {filteredTeamLeaders.map((leader) => (

                  <tr
                    key={
                      leader._id ||
                      leader.id
                    }
                  >

                    <td>

                      <div className="user-name">
                        {leader.name}
                      </div>

                      <div className="user-email">
                        {leader.email}
                      </div>

                    </td>


                    <td>
                      {leader.phone || "-"}
                    </td>


                    <td>
                      {getLocation(leader)}
                    </td>


                    <td>

                      {leader.superTeamLeader ? (

                        <div className="assigned-user">

                          <strong>
                            {getUserName(
                              leader.superTeamLeader
                            )}
                          </strong>

                          <small>
                            {getUserEmail(
                              leader.superTeamLeader
                            )}
                          </small>

                        </div>

                      ) : (

                        <span className="not-assigned">
                          Not Assigned
                        </span>

                      )}

                    </td>


                    <td>

                      {leader.sellingTeamLeader ? (

                        <div className="assigned-user">

                          <strong>
                            {getUserName(
                              leader.sellingTeamLeader
                            )}
                          </strong>

                          <small>
                            {getUserEmail(
                              leader.sellingTeamLeader
                            )}
                          </small>

                        </div>

                      ) : (

                        <span className="not-assigned">
                          Not Assigned
                        </span>

                      )}

                    </td>


                    <td>
                      <StatusBadge
                        status={leader.status}
                      />
                    </td>


                    <td>

                      <button
                        className="view-button"
                        onClick={() =>
                          openUser(
                            leader,
                            "TEAM LEADER"
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================
          SUPER TEAM LEADERS
      ===================================== */}

      <section className="network-section">

        <div className="section-heading">

          <div>
            <h2>Super Team Leaders</h2>

            <p>
              Super Team Leaders and their assignments.
            </p>
          </div>

          <span className="section-count">
            {filteredSuperTeamLeaders.length}
          </span>

        </div>


        {filteredSuperTeamLeaders.length === 0 ? (

          <div className="empty-network">
            No Super Team Leaders found.
          </div>

        ) : (

          <div className="network-table-wrapper">

            <table className="network-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Selling Team Leader</th>
                  <th>Distributor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {filteredSuperTeamLeaders.map((leader) => (

                  <tr
                    key={
                      leader._id ||
                      leader.id
                    }
                  >

                    <td>

                      <div className="user-name">
                        {leader.name}
                      </div>

                      <div className="user-email">
                        {leader.email}
                      </div>

                    </td>


                    <td>
                      {leader.phone || "-"}
                    </td>


                    <td>
                      {getLocation(leader)}
                    </td>


                    <td>

                      {leader.sellingTeamLeader ? (

                        <div className="assigned-user">

                          <strong>
                            {getUserName(
                              leader.sellingTeamLeader
                            )}
                          </strong>

                          <small>
                            {getUserEmail(
                              leader.sellingTeamLeader
                            )}
                          </small>

                        </div>

                      ) : (

                        <span className="not-assigned">
                          Not Assigned
                        </span>

                      )}

                    </td>


                    <td>

                      {leader.distributor ? (

                        <div className="assigned-user">

                          <strong>
                            {getUserName(
                              leader.distributor
                            )}
                          </strong>

                          <small>
                            {getUserEmail(
                              leader.distributor
                            )}
                          </small>

                        </div>

                      ) : (

                        <span className="not-assigned">
                          Not Assigned
                        </span>

                      )}

                    </td>


                    <td>
                      <StatusBadge
                        status={leader.status}
                      />
                    </td>


                    <td>

                      <button
                        className="view-button"
                        onClick={() =>
                          openUser(
                            leader,
                            "SUPER TEAM LEADER"
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


// ==========================================
// USER DETAILS
// ==========================================

function UserDetails({
  user,
  onClose,
  getRoleLabel,
  getUserName,
  getUserEmail,
  getLocation,
  formatDate
}) {

  return (
    <section className="user-details-card">

      <div className="details-header">

        <div>

          <span className="details-label">
            USER DETAILS
          </span>

          <h2>
            {user.name || "Unknown User"}
          </h2>

          <p>
            {getRoleLabel(user.role)}
          </p>

        </div>


        <button
          className="close-details"
          onClick={onClose}
        >
          ×
        </button>

      </div>


      {/* BASIC INFORMATION */}

      <div className="details-section">

        <h3>Basic Information</h3>

        <div className="details-grid">

          <DetailItem
            label="Name"
            value={user.name}
          />

          <DetailItem
            label="Email"
            value={user.email}
          />

          <DetailItem
            label="Phone"
            value={user.phone}
          />

          <DetailItem
            label="Role"
            value={getRoleLabel(user.role)}
          />

          <DetailItem
            label="Status"
            value={user.status}
          />

          <DetailItem
            label="Referral Code"
            value={user.referralCode}
          />

          <DetailItem
            label="Address"
            value={user.address}
          />

          <DetailItem
            label="City"
            value={user.city}
          />

          <DetailItem
            label="District"
            value={user.district}
          />

          <DetailItem
            label="State"
            value={user.state}
          />

          <DetailItem
            label="Pincode"
            value={user.pincode}
          />

          <DetailItem
            label="Joined"
            value={formatDate(user.createdAt)}
          />

        </div>

      </div>


      {/* REFERRAL */}

      <div className="details-section">

        <h3>Referral Information</h3>

        <div className="details-grid">

          <DetailItem
            label="Referred By"
            value={
              user.referredBy?.name ||
              (
                typeof user.referredBy === "string"
                  ? user.referredBy
                  : null
              ) ||
              "No Referrer"
            }
          />

          <DetailItem
            label="Referrer Email"
            value={
              user.referredBy?.email ||
              "-"
            }
          />

        </div>

      </div>


      {/* TEAM ASSIGNMENTS */}

      <div className="details-section">

        <h3>Team Assignments</h3>

        <div className="details-grid">

          <AssignmentItem
            label="Team Leader"
            user={user.teamLeader}
            getUserName={getUserName}
            getUserEmail={getUserEmail}
          />

          <AssignmentItem
            label="Super Team Leader"
            user={user.superTeamLeader}
            getUserName={getUserName}
            getUserEmail={getUserEmail}
          />

          <AssignmentItem
            label="Selling Team Leader"
            user={user.sellingTeamLeader}
            getUserName={getUserName}
            getUserEmail={getUserEmail}
          />

          <AssignmentItem
            label="Distributor"
            user={user.distributor}
            getUserName={getUserName}
            getUserEmail={getUserEmail}
          />

        </div>

      </div>


      {/* ID */}

      <div className="details-section">

        <h3>System Information</h3>

        <div className="details-grid">

          <DetailItem
            label="User ID"
            value={
              user._id ||
              user.id ||
              "-"
            }
          />

          <DetailItem
            label="User Type"
            value={
              user.userType || "-"
            }
          />

        </div>

      </div>

    </section>
  );
}


// ==========================================
// DETAIL ITEM
// ==========================================

function DetailItem({ label, value }) {

  return (
    <div className="detail-item">

      <span>
        {label}
      </span>

      <strong>
        {value || "-"}
      </strong>

    </div>
  );
}


// ==========================================
// ASSIGNMENT ITEM
// ==========================================

function AssignmentItem({
  label,
  user,
  getUserName,
  getUserEmail
}) {

  return (
    <div className="detail-item">

      <span>
        {label}
      </span>

      {user ? (

        <div className="detail-assigned-user">

          <strong>
            {getUserName(user)}
          </strong>

          <small>
            {getUserEmail(user)}
          </small>

        </div>

      ) : (

        <strong className="detail-not-assigned">
          Not Assigned
        </strong>

      )}

    </div>
  );
}


// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }) {

  return (
    <span
      className={`status-badge ${(
        status || ""
      ).toLowerCase()}`}
    >
      {status || "-"}
    </span>
  );
}


export default Network;
