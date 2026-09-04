import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import "./TeamLeaders.css";

function TeamLeaders() {

  const [teamLeaders, setTeamLeaders] = useState([]);

  const [selectedLeader, setSelectedLeader] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [memberSearch, setMemberSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD TEAM LEADERS
  // ==========================================

  async function loadTeamLeaders() {

    try {

      setLoading(true);
      setError("");

      const data =
        await api("/cto/team-leaders", {
          method: "GET"
        });

      setTeamLeaders(
        data.users || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load Team Leaders"
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadTeamLeaders();

  }, []);


  // ==========================================
  // SEARCH TEAM LEADERS
  // ==========================================

  const filteredLeaders =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return teamLeaders;
      }

      return teamLeaders.filter(
        (leader) => {

          return (

            leader.name
              ?.toLowerCase()
              .includes(value)

            ||

            leader.email
              ?.toLowerCase()
              .includes(value)

            ||

            leader.phone
              ?.toLowerCase()
              .includes(value)

            ||

            leader.city
              ?.toLowerCase()
              .includes(value)

            ||

            leader.referralCode
              ?.toLowerCase()
              .includes(value)

          );

        }
      );

    }, [teamLeaders, search]);


  // ==========================================
  // MEMBERS OF SELECTED TEAM LEADER
  // ==========================================

  const filteredMembers =
    useMemo(() => {

      if (!selectedLeader) {
        return [];
      }

      const members =
        selectedLeader.assignedMembers || [];

      const value =
        memberSearch
          .trim()
          .toLowerCase();

      if (!value) {
        return members;
      }

      return members.filter(
        (member) => {

          return (

            member.name
              ?.toLowerCase()
              .includes(value)

            ||

            member.email
              ?.toLowerCase()
              .includes(value)

            ||

            member.phone
              ?.toLowerCase()
              .includes(value)

            ||

            member.city
              ?.toLowerCase()
              .includes(value)

            ||

            member.referralCode
              ?.toLowerCase()
              .includes(value)

          );

        }
      );

    }, [
      selectedLeader,
      memberSearch
    ]);


  // ==========================================
  // VIEW TEAM LEADER
  // ==========================================

  function handleView(leader) {

    setSelectedLeader(leader);

    setMemberSearch("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  // ==========================================
  // CLOSE DETAILS
  // ==========================================

  function closeDetails() {

    setSelectedLeader(null);

    setMemberSearch("");

  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="cto-page">

        <div className="page-loading">
          Loading Team Leaders...
        </div>

      </div>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="cto-page">

        <div className="page-error">

          <h3>
            Unable to load Team Leaders
          </h3>

          <p>
            {error}
          </p>

          <button
            onClick={loadTeamLeaders}
          >
            Retry
          </button>

        </div>

      </div>

    );

  }


  return (

    <div className="cto-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-header">

        <div>

          <h1>
            Team Leaders
          </h1>

          <p>
            Manage Team Leaders and view
            their assigned members.
          </p>

        </div>

        <div className="header-count">

          <strong>
            {teamLeaders.length}
          </strong>

          <span>
            Team Leaders
          </span>

        </div>

      </div>


      {/* =====================================
          SELECTED TEAM LEADER DETAILS
      ===================================== */}

      {selectedLeader && (

        <section className="leader-details-card">

          <div className="details-header">

            <div>

              <h2>
                {selectedLeader.name}
              </h2>

              <span className="role-badge">
                TEAM LEADER
              </span>

            </div>

            <button
              className="close-details"
              onClick={closeDetails}
            >
              ×
            </button>

          </div>


          {/* BASIC DETAILS */}

          <div className="details-grid">

            <div className="detail-item">

              <span>Name</span>

              <strong>
                {selectedLeader.name || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>Email</span>

              <strong>
                {selectedLeader.email || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>Phone</span>

              <strong>
                {selectedLeader.phone || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>City</span>

              <strong>
                {selectedLeader.city || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>District</span>

              <strong>
                {selectedLeader.district || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>State</span>

              <strong>
                {selectedLeader.state || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>Pincode</span>

              <strong>
                {selectedLeader.pincode || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>Referral Code</span>

              <strong>
                {selectedLeader.referralCode || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>Status</span>

              <strong>
                {selectedLeader.status || "-"}
              </strong>

            </div>

            <div className="detail-item">

              <span>Super Team Leader</span>

              <strong>
                {
                  selectedLeader.superTeamLeader?.name ||
                  "Not Assigned"
                }
              </strong>

            </div>

            <div className="detail-item">

              <span>Assigned Members</span>

              <strong>
                {
                  selectedLeader.assignedMemberCount || 0
                }
              </strong>

            </div>

          </div>


          {/* =================================
              ASSIGNED MEMBERS
          ================================= */}

          <div className="assigned-members-section">

            <div className="section-title-row">

              <div>

                <h3>
                  Assigned Members
                </h3>

                <p>
                  Members currently assigned
                  to this Team Leader.
                </p>

              </div>

              <div className="member-count">

                {
                  selectedLeader.assignedMemberCount ||
                  0
                }

              </div>

            </div>


            {/* MEMBER SEARCH */}

            <div className="member-search">

              <input
                type="text"
                placeholder="Search member by name, email, phone or city..."
                value={memberSearch}
                onChange={(e) =>
                  setMemberSearch(
                    e.target.value
                  )
                }
              />

            </div>


            {/* MEMBER LIST */}

            {filteredMembers.length === 0 ? (

              <div className="empty-members">

                <h4>
                  No Members Found
                </h4>

                <p>
                  No members are currently
                  assigned to this Team Leader.
                </p>

              </div>

            ) : (

              <div className="members-table-wrapper">

                <table className="members-table">

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Member
                      </th>

                      <th>
                        Contact
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Referred By
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredMembers.map(
                      (member, index) => (

                        <tr key={member._id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>

                            <div className="member-name">

                              <strong>
                                {member.name}
                              </strong>

                              <small>
                                {
                                  member.referralCode ||
                                  "-"
                                }
                              </small>

                            </div>

                          </td>

                          <td>

                            <div>
                              {member.email || "-"}
                            </div>

                            <small>
                              {member.phone || "-"}
                            </small>

                          </td>

                          <td>

                            <div>
                              {member.city || "-"}
                            </div>

                            <small>
                              {member.district || ""}
                            </small>

                          </td>

                          <td>

                            <span
                              className={`status ${
                                member.status
                                  ?.toLowerCase()
                              }`}
                            >
                              {
                                member.status ||
                                "-"
                              }
                            </span>

                          </td>

                          <td>

                            {
                              member.referredBy?.name ||
                              "Direct"
                            }

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

      )}


      {/* =====================================
          TEAM LEADER SEARCH
      ===================================== */}

      <div className="search-box">

        <input
          type="text"
          placeholder="Search Team Leader by name, email, phone, city..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {search && (

          <button
            onClick={() => setSearch("")}
          >
            ×
          </button>

        )}

      </div>


      {/* =====================================
          TEAM LEADERS LIST
      ===================================== */}

      <section className="leaders-card">

        <div className="list-header">

          <div>

            <h2>
              Team Leader List
            </h2>

            <p>
              {filteredLeaders.length}
              {" "}
              Team Leaders found
            </p>

          </div>

        </div>


        {filteredLeaders.length === 0 ? (

          <div className="empty-state">

            <h3>
              No Team Leaders Found
            </h3>

            <p>
              No Team Leader matches
              your search.
            </p>

          </div>

        ) : (

          <div className="leaders-table-wrapper">

            <table className="leaders-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Team Leader
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Super Team Leader
                  </th>

                  <th>
                    Members
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredLeaders.map(
                  (leader, index) => (

                    <tr key={leader._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        <div className="leader-name">

                          <strong>
                            {leader.name}
                          </strong>

                          <small>
                            {
                              leader.referralCode ||
                              "-"
                            }
                          </small>

                        </div>

                      </td>

                      <td>

                        <div>
                          {leader.email || "-"}
                        </div>

                        <small>
                          {leader.phone || "-"}
                        </small>

                      </td>

                      <td>

                        <div>
                          {leader.city || "-"}
                        </div>

                        <small>
                          {leader.district || ""}
                        </small>

                      </td>

                      <td>

                        {
                          leader.superTeamLeader?.name ||
                          "Not Assigned"
                        }

                      </td>

                      <td>

                        <span className="member-badge">

                          {
                            leader.assignedMemberCount ||
                            0
                          }

                        </span>

                      </td>

                      <td>

                        <span
                          className={`status ${
                            leader.status
                              ?.toLowerCase()
                          }`}
                        >
                          {
                            leader.status ||
                            "-"
                          }
                        </span>

                      </td>

                      <td>

                        <button
                          className="view-button"
                          onClick={() =>
                            handleView(
                              leader
                            )
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>

  );

}

export default TeamLeaders;