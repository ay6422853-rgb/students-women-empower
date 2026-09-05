
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import "./TeamBuilding.css";

function TeamBuilding() {
  const [data, setData] = useState({
    summary: {
      totalMembers: 0,
      totalTeamLeaders: 0,
      totalSuperTeamLeaders: 0,
      unassignedMembers: 0,
      unassignedTeamLeaders: 0
    },
    unassignedMembers: [],
    unassignedTeamLeaders: [],
    teamLeaders: [],
    superTeamLeaders: []
  });

  const [selectedType, setSelectedType] = useState("MEMBER");
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);

  const [selectedLeader, setSelectedLeader] = useState(null);
  const [leaderSearch, setLeaderSearch] = useState("");

  const [detailsUser, setDetailsUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const result =
        await api("/cto/team-building");

      setData(result);

    } catch (err) {

      setError(
        err.message ||
        "Unable to load Team Building data"
      );

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    loadData();
  }, []);


  // ==========================================
  // RESET SELECTION
  // ==========================================

  function selectType(type) {

    setSelectedType(type);
    setSearch("");
    setSelectedIds([]);
    setSelectedLeader(null);
    setLeaderSearch("");
    setDetailsUser(null);
    setMessage("");
    setError("");

  }


  // ==========================================
  // CURRENT LIST
  // ==========================================

  const currentList = useMemo(() => {

    if (selectedType === "MEMBER") {

      return data.unassignedMembers || [];

    }

    if (selectedType === "TEAM_LEADER") {

      return data.unassignedTeamLeaders || [];

    }

    if (selectedType === "SUPER_TEAM_LEADER") {

      return data.superTeamLeaders || [];

    }

    return [];

  }, [data, selectedType]);


  // ==========================================
  // SEARCH LIST
  // ==========================================

  const filteredList = useMemo(() => {

    const value =
      search.toLowerCase().trim();

    if (!value) {
      return currentList;
    }

    return currentList.filter((user) => {

      const text = [

        user.name,
        user.email,
        user.phone,
        user.city,
        user.district,
        user.state,
        user.pincode,
        user.referralCode,

        user.referredBy?.name,
        user.referredBy?.email

      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(value);

    });

  }, [currentList, search]);


  // ==========================================
  // SELECT / UNSELECT
  // ==========================================

  function toggleSelection(id) {

    setSelectedIds((previous) => {

      if (previous.includes(id)) {

        return previous.filter(
          item => item !== id
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

  function toggleSelectAll() {

    const visibleIds =
      filteredList.map(
        user => user._id
      );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every(
        id => selectedIds.includes(id)
      );

    if (allSelected) {

      setSelectedIds(
        selectedIds.filter(
          id => !visibleIds.includes(id)
        )
      );

    } else {

      setSelectedIds([
        ...new Set([
          ...selectedIds,
          ...visibleIds
        ])
      ]);

    }

  }


  // ==========================================
  // ACTIVE TEAM LEADERS
  // ==========================================

  const filteredTeamLeaders =
    useMemo(() => {

      const value =
        leaderSearch
          .toLowerCase()
          .trim();

      const list =
        data.teamLeaders || [];

      if (!value) {
        return list;
      }

      return list.filter((leader) => {

        const text = [

          leader.name,
          leader.email,
          leader.phone,
          leader.city,
          leader.district,
          leader.state,
          leader.pincode,
          leader.referralCode

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(value);

      });

    }, [
      data.teamLeaders,
      leaderSearch
    ]);


  // ==========================================
  // ACTIVE SUPER TEAM LEADERS
  // ==========================================

  const filteredSuperTeamLeaders =
    useMemo(() => {

      const value =
        leaderSearch
          .toLowerCase()
          .trim();

      const list =
        data.superTeamLeaders || [];

      if (!value) {
        return list;
      }

      return list.filter((leader) => {

        const text = [

          leader.name,
          leader.email,
          leader.phone,
          leader.city,
          leader.district,
          leader.state,
          leader.pincode,
          leader.referralCode

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(value);

      });

    }, [
      data.superTeamLeaders,
      leaderSearch
    ]);


  // ==========================================
  // SINGLE ASSIGN
  // ==========================================

  async function assignSingle(user) {

    if (!selectedLeader) {

      setError(
        selectedType === "MEMBER"
          ? "Please select a Team Leader"
          : "Please select a Super Team Leader"
      );

      return;

    }

    try {

      setAssigning(true);
      setMessage("");
      setError("");

      let result;

      if (selectedType === "MEMBER") {

        result =
          await api(
            `/cto/members/${user._id}/team-leader`,
            {
              method: "PATCH",
              body: JSON.stringify({
                teamLeaderId:
                  selectedLeader._id
              })
            }
          );

      } else {

        result =
          await api(
            `/cto/team-leaders/${user._id}/super-team-leader`,
            {
              method: "PATCH",
              body: JSON.stringify({
                superTeamLeaderId:
                  selectedLeader._id
              })
            }
          );

      }

      setMessage(
        result.message ||
        "Assignment successful"
      );

      setSelectedIds([]);
      setSelectedLeader(null);

      await loadData();

    } catch (err) {

      setError(
        err.message ||
        "Assignment failed"
      );

    } finally {

      setAssigning(false);

    }

  }


  // ==========================================
  // BULK ASSIGN
  // ==========================================

  async function bulkAssign() {

    if (selectedIds.length === 0) {

      setError(
        selectedType === "MEMBER"
          ? "Please select at least one Member"
          : "Please select at least one Team Leader"
      );

      return;

    }

    if (!selectedLeader) {

      setError(
        selectedType === "MEMBER"
          ? "Please select a Team Leader"
          : "Please select a Super Team Leader"
      );

      return;

    }

    try {

      setAssigning(true);
      setMessage("");
      setError("");

      let result;

      if (selectedType === "MEMBER") {

        result =
          await api(
            "/cto/members/bulk-team-leader",
            {
              method: "PATCH",
              body: JSON.stringify({

                memberIds:
                  selectedIds,

                teamLeaderId:
                  selectedLeader._id

              })
            }
          );

      } else {

        result =
          await api(
            "/cto/team-leaders/bulk-super-team-leader",
            {
              method: "PATCH",
              body: JSON.stringify({

                teamLeaderIds:
                  selectedIds,

                superTeamLeaderId:
                  selectedLeader._id

              })
            }
          );

      }

      setMessage(
        result.message ||
        "Bulk assignment successful"
      );

      setSelectedIds([]);
      setSelectedLeader(null);
      setLeaderSearch("");

      await loadData();

    } catch (err) {

      setError(
        err.message ||
        "Bulk assignment failed"
      );

    } finally {

      setAssigning(false);

    }

  }


  // ==========================================
  // DETAILS
  // ==========================================

  function viewUser(user) {

    setDetailsUser(user);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="team-building-page">

        <div className="loading-box">
          Loading Team Building...
        </div>

      </div>
    );

  }


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="team-building-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-header">

        <div>

          <h1>
            Team Building
          </h1>

          <p>
            Manage Members, Team Leaders and
            Super Team Leaders
          </p>

        </div>

        <button
          className="refresh-btn"
          onClick={loadData}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}


      {/* =====================================
          USER DETAILS
      ===================================== */}

      {detailsUser && (

        <div className="details-card">

          <div className="details-header">

            <div>

              <h2>
                {detailsUser.name}
              </h2>

              <span className="role-badge">
                {detailsUser.role?.replace(
                  /_/g,
                  " "
                )}
              </span>

            </div>

            <button
              className="close-details"
              onClick={() =>
                setDetailsUser(null)
              }
            >
              ×
            </button>

          </div>


          <div className="details-grid">

            <div>
              <label>Email</label>
              <strong>
                {detailsUser.email || "-"}
              </strong>
            </div>

            <div>
              <label>Phone</label>
              <strong>
                {detailsUser.phone || "-"}
              </strong>
            </div>

            <div>
              <label>Address</label>
              <strong>
                {detailsUser.address || "-"}
              </strong>
            </div>

            <div>
              <label>City</label>
              <strong>
                {detailsUser.city || "-"}
              </strong>
            </div>

            <div>
              <label>District</label>
              <strong>
                {detailsUser.district || "-"}
              </strong>
            </div>

            <div>
              <label>State</label>
              <strong>
                {detailsUser.state || "-"}
              </strong>
            </div>

            <div>
              <label>Pincode</label>
              <strong>
                {detailsUser.pincode || "-"}
              </strong>
            </div>

            <div>
              <label>Referral Code</label>
              <strong>
                {detailsUser.referralCode || "-"}
              </strong>
            </div>

          </div>


          {detailsUser.referredBy && (

            <div className="referred-box">

              <strong>
                Referred By
              </strong>

              <span>
                {detailsUser.referredBy.name}
              </span>

              <small>
                {detailsUser.referredBy.email}
              </small>

            </div>

          )}

        </div>

      )}


      {/* =====================================
          SUMMARY BOXES
      ===================================== */}

      <div className="summary-grid">

        <button
          className={`summary-box ${
            selectedType === "MEMBER"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            selectType("MEMBER")
          }
        >

          <span className="summary-icon">
            👤
          </span>

          <span className="summary-title">
            Members
          </span>

          <strong>
            {data.summary.totalMembers}
          </strong>

          <small>
            Unassigned:{" "}
            {data.summary.unassignedMembers}
          </small>

        </button>


        <button
          className={`summary-box ${
            selectedType === "TEAM_LEADER"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            selectType("TEAM_LEADER")
          }
        >

          <span className="summary-icon">
            👥
          </span>

          <span className="summary-title">
            Team Leaders
          </span>

          <strong>
            {data.summary.totalTeamLeaders}
          </strong>

          <small>
            Unassigned:{" "}
            {data.summary.unassignedTeamLeaders}
          </small>

        </button>


        <button
          className={`summary-box ${
            selectedType === "SUPER_TEAM_LEADER"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            selectType(
              "SUPER_TEAM_LEADER"
            )
          }
        >

          <span className="summary-icon">
            ⭐
          </span>

          <span className="summary-title">
            Super Team Leaders
          </span>

          <strong>
            {data.summary.totalSuperTeamLeaders}
          </strong>

          <small>
            Active:{" "}
            {data.superTeamLeaders.length}
          </small>

        </button>

      </div>


      {/* =====================================
          ASSIGNMENT CONTROLS
      ===================================== */}

      {(selectedType === "MEMBER" ||
        selectedType === "TEAM_LEADER") && (

        <div className="assignment-panel">

          <div className="assignment-header">

            <div>

              <h2>

                {selectedType === "MEMBER"
                  ? "Assign Members"
                  : "Assign Team Leaders"}

              </h2>

              <p>

                {selectedType === "MEMBER"
                  ? "Select Members and assign them to a Team Leader"
                  : "Select Team Leaders and assign them to a Super Team Leader"}

              </p>

            </div>

            <div className="selected-count">

              {selectedIds.length}
              {" "}
              Selected

            </div>

          </div>


          {/* TARGET SEARCH */}

          <div className="target-section">

            <label>

              {selectedType === "MEMBER"
                ? "Search Team Leader"
                : "Search Super Team Leader"}

            </label>

            <input
              type="text"
              placeholder={
                selectedType === "MEMBER"
                  ? "Search Team Leader by name, email, phone..."
                  : "Search Super Team Leader by name, email, phone..."
              }
              value={leaderSearch}
              onChange={(e) =>
                setLeaderSearch(
                  e.target.value
                )
              }
            />


            <div className="target-list">

              {(selectedType === "MEMBER"
                ? filteredTeamLeaders
                : filteredSuperTeamLeaders
              ).map((leader) => (

                <button
                  type="button"
                  key={leader._id}
                  className={`target-card ${
                    selectedLeader?._id ===
                    leader._id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedLeader(
                      leader
                    )
                  }
                >

                  <div className="target-avatar">
                    {leader.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="target-info">

                    <strong>
                      {leader.name}
                    </strong>

                    <span>
                      {leader.email}
                    </span>

                    <small>
                      {leader.phone}
                      {" • "}
                      {leader.city}
                    </small>

                  </div>

                  {selectedLeader?._id ===
                    leader._id && (

                    <span className="selected-mark">
                      ✓
                    </span>

                  )}

                </button>

              ))}

            </div>

          </div>


          {/* BULK BUTTON */}

          <div className="bulk-action-bar">

            <button
              className="bulk-assign-btn"
              onClick={bulkAssign}
              disabled={
                assigning ||
                selectedIds.length === 0 ||
                !selectedLeader
              }
            >

              {assigning
                ? "Assigning..."
                : `Assign ${selectedIds.length} Selected`}

            </button>

          </div>

        </div>

      )}


      {/* =====================================
          LIST
      ===================================== */}

      <div className="users-panel">

        <div className="users-panel-header">

          <div>

            <h2>

              {selectedType === "MEMBER"
                ? "Unassigned Members"
                : selectedType === "TEAM_LEADER"
                ? "Unassigned Team Leaders"
                : "Super Team Leaders"}

            </h2>

            <p>
              {filteredList.length} users shown
            </p>

          </div>


          <div className="list-actions">

            <input
              type="text"
              className="list-search"
              placeholder="Search name, email, phone, city..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {(selectedType === "MEMBER" ||
              selectedType === "TEAM_LEADER") && (

              <button
                className="select-all-btn"
                onClick={toggleSelectAll}
              >
                {filteredList.length > 0 &&
                filteredList.every(
                  user =>
                    selectedIds.includes(
                      user._id
                    )
                )
                  ? "Unselect All"
                  : "Select All"}
              </button>

            )}

          </div>

        </div>


        {filteredList.length === 0 ? (

          <div className="empty-state">

            <div>
              ✓
            </div>

            <h3>
              No users found
            </h3>

            <p>
              There are no users matching
              your search.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  {(selectedType === "MEMBER" ||
                    selectedType === "TEAM_LEADER") && (

                    <th>
                      <input
                        type="checkbox"
                        checked={
                          filteredList.length > 0 &&
                          filteredList.every(
                            user =>
                              selectedIds.includes(
                                user._id
                              )
                          )
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>

                  )}

                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Referred By</th>
                  <th>Action</th>

                </tr>

              </thead>


              <tbody>

                {filteredList.map((user) => (

                  <tr key={user._id}>

                    {(selectedType === "MEMBER" ||
                      selectedType === "TEAM_LEADER") && (

                      <td>

                        <input
                          type="checkbox"
                          checked={
                            selectedIds.includes(
                              user._id
                            )
                          }
                          onChange={() =>
                            toggleSelection(
                              user._id
                            )
                          }
                        />

                      </td>

                    )}


                    <td>

                      <div className="user-name-cell">

                        <div className="user-avatar">

                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase()}

                        </div>

                        <div>

                          <strong>
                            {user.name}
                          </strong>

                          <small>
                            {user.role?.replace(
                              /_/g,
                              " "
                            )}
                          </small>

                        </div>

                      </div>

                    </td>


                    <td>
                      {user.phone || "-"}
                    </td>


                    <td>
                      {user.email || "-"}
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

                      {user.referredBy ? (

                        <div className="referrer-cell">

                          <strong>
                            {user.referredBy.name}
                          </strong>

                          <small>
                            {user.referredBy.email}
                          </small>

                        </div>

                      ) : (

                        <span className="muted">
                          No Referrer
                        </span>

                      )}

                    </td>


                    <td>

                      <div className="row-actions">

                        <button
                          className="view-btn"
                          onClick={() =>
                            viewUser(user)
                          }
                        >
                          View
                        </button>


                        {(selectedType === "MEMBER" ||
                          selectedType ===
                            "TEAM_LEADER") && (

                          <button
                            className="single-assign-btn"
                            onClick={() =>
                              assignSingle(user)
                            }
                            disabled={
                              assigning ||
                              !selectedLeader
                            }
                          >
                            Assign
                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================
          MOBILE SELECTED SUMMARY
      ===================================== */}

      {selectedIds.length > 0 && (

        <div className="mobile-selection-bar">

          <strong>
            {selectedIds.length}
            {" "}
            selected
          </strong>

          <button
            onClick={bulkAssign}
            disabled={
              assigning ||
              !selectedLeader
            }
          >
            Assign Selected
          </button>

        </div>

      )}

    </div>

  );

}

export default TeamBuilding;

