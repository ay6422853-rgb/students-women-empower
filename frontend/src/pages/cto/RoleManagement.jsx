import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import "./RoleManagement.css";

function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD USERS
  // ==========================================

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/cto/network", {
        method: "GET",
      });

      setUsers(data.users || []);
    } catch (err) {
      console.error("Role Management Load Error:", err);

      setError(
        err.message || "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // FILTER USERS
  // ==========================================

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !value ||
        user.name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        user.phone?.toLowerCase().includes(value) ||
        user.city?.toLowerCase().includes(value) ||
        user.district?.toLowerCase().includes(value) ||
        user.state?.toLowerCase().includes(value) ||
        user.referralCode?.toLowerCase().includes(value);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ==========================================
  // CHANGE ROLE IN LOCAL STATE
  // ==========================================

  function handleRoleChange(id, newRole) {
    setUsers((previous) =>
      previous.map((user) =>
        user._id === id
          ? {
              ...user,
              selectedRole: newRole,
            }
          : user
      )
    );
  }

  // ==========================================
  // UPDATE ROLE
  // ==========================================

  async function updateRole(user) {
    const newRole =
      user.selectedRole || user.role;

    if (!newRole) {
      return;
    }

    if (newRole === user.role) {
      setMessage("No role change required.");
      return;
    }

    try {
      setUpdatingId(user._id);
      setError("");
      setMessage("");

      const data = await api(
        `/cto/users/${user._id}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      setMessage(
        data.message ||
          "Role updated successfully"
      );

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? {
                ...item,
                role: newRole,
                selectedRole: newRole,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Role Update Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update role"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ==========================================
  // ROLE COUNTS
  // ==========================================

  const memberCount = users.filter(
    (user) => user.role === "MEMBER"
  ).length;

  const teamLeaderCount = users.filter(
    (user) => user.role === "TEAM_LEADER"
  ).length;

  const superTeamLeaderCount = users.filter(
    (user) =>
      user.role === "SUPER_TEAM_LEADER"
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="role-page">
        <div className="role-loading">
          Loading Role Management...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR PAGE
  // ==========================================

  if (error && users.length === 0) {
    return (
      <div className="role-page">
        <div className="role-error">
          <h3>
            Unable to load Role Management
          </h3>

          <p>{error}</p>

          <button onClick={loadUsers}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="role-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="role-page-header">

        <div>
          <h1>
            Role Management
          </h1>

          <p>
            Manage Member, Team Leader and
            Super Team Leader roles.
          </p>
        </div>

        <div className="total-users-box">
          <strong>
            {users.length}
          </strong>

          <span>
            Total Users
          </span>
        </div>

      </div>

      {/* ======================================
          MESSAGES
      ====================================== */}

      {message && (
        <div className="role-success">
          {message}
        </div>
      )}

      {error && (
        <div className="role-inline-error">
          {error}
        </div>
      )}

      {/* ======================================
          ROLE SUMMARY
      ====================================== */}

      <div className="role-summary">

        <div className="summary-card">
          <span className="summary-label">
            Members
          </span>

          <strong>
            {memberCount}
          </strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Team Leaders
          </span>

          <strong>
            {teamLeaderCount}
          </strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Super Team Leaders
          </span>

          <strong>
            {superTeamLeaderCount}
          </strong>
        </div>

      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="role-toolbar">

        <div className="role-search">

          <input
            type="text"
            placeholder="Search name, email, phone, city..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
        >
          <option value="ALL">
            All Roles
          </option>

          <option value="MEMBER">
            Member
          </option>

          <option value="TEAM_LEADER">
            Team Leader
          </option>

          <option value="SUPER_TEAM_LEADER">
            Super Team Leader
          </option>
        </select>

        <button
          className="refresh-button"
          onClick={loadUsers}
        >
          Refresh
        </button>

      </div>

      {/* ======================================
          TABLE CARD
      ====================================== */}

      <section className="role-table-card">

        <div className="role-table-header">

          <div>
            <h2>
              Users
            </h2>

            <p>
              {filteredUsers.length} users found
            </p>
          </div>

        </div>

        {filteredUsers.length === 0 ? (
          <div className="role-empty">
            <h3>
              No Users Found
            </h3>

            <p>
              Try changing your search or
              role filter.
            </p>
          </div>
        ) : (

          <div className="role-table-wrapper">

            <table className="role-table">

              <thead>
                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Referral Code
                  </th>

                  <th>
                    Current Role
                  </th>

                  <th>
                    Change Role
                  </th>

                  <th>
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredUsers.map(
                  (user, index) => {

                    const selectedRole =
                      user.selectedRole ||
                      user.role;

                    const isUpdating =
                      updatingId ===
                      user._id;

                    return (
                      <tr key={user._id}>

                        {/* NUMBER */}

                        <td>
                          {index + 1}
                        </td>

                        {/* USER */}

                        <td>

                          <div className="user-info">

                            <div className="user-avatar">
                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}
                            </div>

                            <div>

                              <strong>
                                {user.name ||
                                  "-"}
                              </strong>

                              <small>
                                {user.status ||
                                  "-"}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td>

                          <div className="contact-info">

                            <span>
                              {user.email ||
                                "-"}
                            </span>

                            <small>
                              {user.phone ||
                                "-"}
                            </small>

                          </div>

                        </td>

                        {/* LOCATION */}

                        <td>

                          <div className="location-info">

                            <span>
                              {user.city ||
                                "-"}
                            </span>

                            <small>
                              {user.district ||
                                ""}
                            </small>

                            <small>
                              {user.state ||
                                ""}
                            </small>

                          </div>

                        </td>

                        {/* REFERRAL CODE */}

                        <td>

                          <span className="referral-code">
                            {user.referralCode ||
                              "-"}
                          </span>

                        </td>

                        {/* CURRENT ROLE */}

                        <td>

                          <span
                            className={`current-role role-${user.role
                              ?.toLowerCase()
                              .replaceAll(
                                "_",
                                "-"
                              )}`}
                          >
                            {user.role ||
                              "-"}
                          </span>

                        </td>

                        {/* CHANGE ROLE */}

                        <td>

                          <select
                            className="role-select"
                            value={selectedRole}
                            onChange={(e) =>
                              handleRoleChange(
                                user._id,
                                e.target.value
                              )
                            }
                            disabled={
                              isUpdating
                            }
                          >

                            <option value="MEMBER">
                              MEMBER
                            </option>

                            <option value="TEAM_LEADER">
                              TEAM LEADER
                            </option>

                            <option value="SUPER_TEAM_LEADER">
                              SUPER TEAM LEADER
                            </option>

                          </select>

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            className="update-role-button"
                            disabled={
                              isUpdating ||
                              selectedRole ===
                                user.role
                            }
                            onClick={() =>
                              updateRole(user)
                            }
                          >

                            {isUpdating
                              ? "Updating..."
                              : "Update"}

                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default RoleManagement;
