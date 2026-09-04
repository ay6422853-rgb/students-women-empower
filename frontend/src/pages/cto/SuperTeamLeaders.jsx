import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import "./SuperTeamLeaders.css";

function SuperTeamLeaders() {
  const [superTeamLeaders, setSuperTeamLeaders] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);

  const [selectedSTL, setSelectedSTL] = useState(null);
  const [selectedTeamLeaders, setSelectedTeamLeaders] = useState([]);

  const [search, setSearch] = useState("");
  const [teamLeaderSearch, setTeamLeaderSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [stlData, teamLeaderData] = await Promise.all([
        api("/cto/super-team-leaders", {
          method: "GET"
        }),

        api("/cto/team-building", {
          method: "GET"
        })
      ]);

      setSuperTeamLeaders(stlData.users || []);
      setTeamLeaders(teamLeaderData.teamLeaders || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to load Super Team Leaders"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // SEARCH SUPER TEAM LEADERS
  // ==========================================

  const filteredSTLs = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return superTeamLeaders;
    }

    return superTeamLeaders.filter((stl) => {
      return (
        stl.name?.toLowerCase().includes(value) ||
        stl.email?.toLowerCase().includes(value) ||
        stl.phone?.toLowerCase().includes(value) ||
        stl.city?.toLowerCase().includes(value) ||
        stl.district?.toLowerCase().includes(value) ||
        stl.state?.toLowerCase().includes(value) ||
        stl.referralCode?.toLowerCase().includes(value)
      );
    });
  }, [superTeamLeaders, search]);

  // ==========================================
  // ASSIGNED TEAM LEADERS
  // ==========================================

  const assignedTeamLeaders = useMemo(() => {
    if (!selectedSTL) {
      return [];
    }

    return teamLeaders.filter((leader) => {
      const assignedId =
        leader.superTeamLeader?._id ||
        leader.superTeamLeader;

      return (
        String(assignedId) ===
        String(selectedSTL._id)
      );
    });
  }, [teamLeaders, selectedSTL]);

  // ==========================================
  // UNASSIGNED TEAM LEADERS
  // ==========================================

  const unassignedTeamLeaders = useMemo(() => {
    const value =
      teamLeaderSearch.trim().toLowerCase();

    let list = teamLeaders.filter((leader) => {
      return !leader.superTeamLeader;
    });

    if (!value) {
      return list;
    }

    return list.filter((leader) => {
      return (
        leader.name?.toLowerCase().includes(value) ||
        leader.email?.toLowerCase().includes(value) ||
        leader.phone?.toLowerCase().includes(value) ||
        leader.city?.toLowerCase().includes(value) ||
        leader.district?.toLowerCase().includes(value) ||
        leader.state?.toLowerCase().includes(value) ||
        leader.referralCode?.toLowerCase().includes(value)
      );
    });
  }, [teamLeaders, teamLeaderSearch]);

  // ==========================================
  // SELECT SUPER TEAM LEADER
  // ==========================================

  function handleView(stl) {
    setSelectedSTL(stl);
    setSelectedTeamLeaders([]);
    setTeamLeaderSearch("");
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // ==========================================
  // CLOSE DETAILS
  // ==========================================

  function closeDetails() {
    setSelectedSTL(null);
    setSelectedTeamLeaders([]);
    setTeamLeaderSearch("");
    setMessage("");
    setError("");
  }

  // ==========================================
  // SELECT TEAM LEADER
  // ==========================================

  function toggleTeamLeader(id) {
    setSelectedTeamLeaders((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (item) => item !== id
        );
      }

      return [
        ...previous,
        id
      ];
    });
  }

  // ==========================================
  // SELECT ALL
  // ==========================================

  function selectAllTeamLeaders() {
    const ids =
      unassignedTeamLeaders.map(
        (leader) => leader._id
      );

    setSelectedTeamLeaders(ids);
  }

  // ==========================================
  // CLEAR SELECTION
  // ==========================================

  function clearSelection() {
    setSelectedTeamLeaders([]);
  }

  // ==========================================
  // SINGLE ASSIGN
  // ==========================================

  async function assignSingleTeamLeader(
    teamLeaderId
  ) {
    if (!selectedSTL) {
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setMessage("");

      const data = await api(
        `/cto/team-leaders/${teamLeaderId}/super-team-leader`,
        {
          method: "PATCH",

          body: JSON.stringify({
            superTeamLeaderId:
              selectedSTL._id
          })
        }
      );

      setMessage(
        data.message ||
        "Team Leader assigned successfully"
      );

      await loadData();

      setSelectedTeamLeaders([]);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to assign Team Leader"
      );
    } finally {
      setAssigning(false);
    }
  }

  // ==========================================
  // BULK ASSIGN
  // ==========================================

  async function assignSelectedTeamLeaders() {
    if (!selectedSTL) {
      return;
    }

    if (selectedTeamLeaders.length === 0) {
      alert(
        "Please select at least one Team Leader"
      );

      return;
    }

    try {
      setAssigning(true);
      setError("");
      setMessage("");

      const data = await api(
        "/cto/team-leaders/bulk-super-team-leader",
        {
          method: "PATCH",

          body: JSON.stringify({
            teamLeaderIds:
              selectedTeamLeaders,

            superTeamLeaderId:
              selectedSTL._id
          })
        }
      );

      setMessage(
        data.message ||
        "Team Leaders assigned successfully"
      );

      setSelectedTeamLeaders([]);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to assign Team Leaders"
      );
    } finally {
      setAssigning(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="cto-page">
        <div className="page-loading">
          Loading Super Team Leaders...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (
    error &&
    superTeamLeaders.length === 0
  ) {
    return (
      <div className="cto-page">
        <div className="page-error">

          <h3>
            Unable to load Super Team Leaders
          </h3>

          <p>
            {error}
          </p>

          <button onClick={loadData}>
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
            Super Team Leaders
          </h1>

          <p>
            Manage Super Team Leaders and
            assign Team Leaders under them.
          </p>
        </div>

        <div className="header-count">

          <strong>
            {superTeamLeaders.length}
          </strong>

          <span>
            Super Team Leaders
          </span>

        </div>

      </div>


      {/* =====================================
          MESSAGES
      ===================================== */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="inline-error">
          {error}
        </div>
      )}


      {/* =====================================
          SELECTED STL DETAILS
      ===================================== */}

      {selectedSTL && (
        <section className="stl-details-card">

          {/* HEADER */}

          <div className="details-header">

            <div>

              <h2>
                {selectedSTL.name}
              </h2>

              <span className="role-badge">
                SUPER TEAM LEADER
              </span>

            </div>

            <button
              className="close-details"
              onClick={closeDetails}
            >
              ×
            </button>

          </div>


          {/* =================================
              STL DETAILS
          ================================= */}

          <div className="details-grid">

            <div className="detail-item">
              <span>Name</span>

              <strong>
                {selectedSTL.name || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Email</span>

              <strong>
                {selectedSTL.email || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Phone</span>

              <strong>
                {selectedSTL.phone || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Address</span>

              <strong>
                {selectedSTL.address || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>City</span>

              <strong>
                {selectedSTL.city || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>District</span>

              <strong>
                {selectedSTL.district || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>State</span>

              <strong>
                {selectedSTL.state || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Pincode</span>

              <strong>
                {selectedSTL.pincode || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Referral Code</span>

              <strong>
                {selectedSTL.referralCode || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Status</span>

              <strong>
                {selectedSTL.status || "-"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Selling Team Leader</span>

              <strong>
                {
                  selectedSTL.sellingTeamLeader?.name ||
                  "Not Assigned"
                }
              </strong>
            </div>

            <div className="detail-item">
              <span>Assigned Team Leaders</span>

              <strong>
                {assignedTeamLeaders.length}
              </strong>
            </div>

          </div>


          {/* =================================
              ASSIGNED TEAM LEADERS
          ================================= */}

          <div className="assigned-section">

            <div className="section-title-row">

              <div>

                <h3>
                  Assigned Team Leaders
                </h3>

                <p>
                  Team Leaders currently working
                  under this Super Team Leader.
                </p>

              </div>

              <div className="member-count">
                {assignedTeamLeaders.length}
              </div>

            </div>


            {assignedTeamLeaders.length === 0 ? (

              <div className="empty-box">

                <h4>
                  No Team Leaders Assigned
                </h4>

                <p>
                  Assign Team Leaders from
                  the section below.
                </p>

              </div>

            ) : (

              <div className="leaders-table-wrapper">

                <table className="leaders-table">

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Team Leader</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Members</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {assignedTeamLeaders.map(
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
                                leader.status?.toLowerCase()
                              }`}
                            >
                              {leader.status || "-"}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* =================================
              ASSIGN TEAM LEADERS
          ================================= */}

          <div className="assign-section">

            <div className="section-title-row">

              <div>

                <h3>
                  Assign Team Leaders
                </h3>

                <p>
                  Select unassigned Team Leaders
                  and assign them to this STL.
                </p>

              </div>

              <div className="selected-count">

                {selectedTeamLeaders.length}
                {" "}
                Selected

              </div>

            </div>


            {/* =================================
                SEARCH + CONTROLS
            ================================= */}

            <div className="assign-toolbar">

              <input
                type="text"
                placeholder="Search unassigned Team Leader..."
                value={teamLeaderSearch}
                onChange={(e) =>
                  setTeamLeaderSearch(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={selectAllTeamLeaders}
                disabled={
                  unassignedTeamLeaders.length === 0
                }
              >
                Select All
              </button>

              <button
                type="button"
                onClick={clearSelection}
                disabled={
                  selectedTeamLeaders.length === 0
                }
              >
                Clear
              </button>

            </div>


            {/* =================================
                UNASSIGNED TEAM LEADERS
            ================================= */}

            {unassignedTeamLeaders.length === 0 ? (

              <div className="empty-box">

                <h4>
                  No Unassigned Team Leaders
                </h4>

                <p>
                  All Team Leaders are already
                  assigned to a Super Team Leader.
                </p>

              </div>

            ) : (

              <div className="assign-table-wrapper">

                <table className="assign-table">

                  <thead>

                    <tr>

                      <th>
                        Select
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
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {unassignedTeamLeaders.map(
                      (leader) => (

                        <tr key={leader._id}>

                          <td>

                            <input
                              type="checkbox"
                              checked={
                                selectedTeamLeaders.includes(
                                  leader._id
                                )
                              }
                              onChange={() =>
                                toggleTeamLeader(
                                  leader._id
                                )
                              }
                            />

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

                            <button
                              className="assign-button"
                              disabled={assigning}
                              onClick={() =>
                                assignSingleTeamLeader(
                                  leader._id
                                )
                              }
                            >
                              {assigning
                                ? "Assigning..."
                                : "Assign"
                              }
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}


            {/* =================================
                BULK ACTION
            ================================= */}

            {selectedTeamLeaders.length > 0 && (

              <div className="bulk-action">

                <div>

                  <strong>
                    {selectedTeamLeaders.length}
                    {" "}
                    Team Leaders selected
                  </strong>

                  <p>
                    They will be assigned to{" "}
                    {selectedSTL.name}.
                  </p>

                </div>

                <button
                  className="bulk-assign-button"
                  disabled={assigning}
                  onClick={
                    assignSelectedTeamLeaders
                  }
                >
                  {assigning
                    ? "Assigning..."
                    : "Assign Selected Team Leaders"
                  }
                </button>

              </div>

            )}

          </div>

        </section>
      )}


      {/* =====================================
          STL SEARCH
      ===================================== */}

      <div className="search-box">

        <input
          type="text"
          placeholder="Search Super Team Leader by name, email, phone, city..."
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
          STL LIST
      ===================================== */}

      <section className="leaders-card">

        <div className="list-header">

          <div>

            <h2>
              Super Team Leader List
            </h2>

            <p>
              {filteredSTLs.length}
              {" "}
              Super Team Leaders found
            </p>

          </div>

        </div>


        {filteredSTLs.length === 0 ? (

          <div className="empty-state">

            <h3>
              No Super Team Leaders Found
            </h3>

            <p>
              No Super Team Leader matches
              your search.
            </p>

          </div>

        ) : (

          <div className="leaders-table-wrapper">

            <table className="leaders-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>
                    Super Team Leader
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Selling Team Leader
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

                {filteredSTLs.map(
                  (stl, index) => (

                    <tr key={stl._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        <div className="leader-name">

                          <strong>
                            {stl.name}
                          </strong>

                          <small>
                            {
                              stl.referralCode ||
                              "-"
                            }
                          </small>

                        </div>

                      </td>

                      <td>

                        <div>
                          {stl.email || "-"}
                        </div>

                        <small>
                          {stl.phone || "-"}
                        </small>

                      </td>

                      <td>

                        <div>
                          {stl.city || "-"}
                        </div>

                        <small>
                          {stl.district || ""}
                        </small>

                      </td>

                      <td>

                        {
                          stl.sellingTeamLeader?.name ||
                          "Not Assigned"
                        }

                      </td>

                      <td>

                        <span
                          className={`status ${
                            stl.status?.toLowerCase()
                          }`}
                        >
                          {stl.status || "-"}
                        </span>

                      </td>

                      <td>

                        <button
                          className="view-button"
                          onClick={() =>
                            handleView(stl)
                          }
                        >
                          Manage
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

export default SuperTeamLeaders;