import React, { useEffect, useMemo, useState } from "react";
import "./ReferralNetwork.css";

const API = "https://students-and-women-empower.onrender.com/api";

const ROLES = [
  "MEMBER",
  "TEAM_LEADER",
  "SUPER_TEAM_LEADER",
  "CHIEF_TEAM_OFFICER",
  "PRODUCT_MANAGER",
  "CASH_MANAGER",
  "DISTRIBUTION_MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
];

const STATUSES = ["ACTIVE", "PENDING", "SUSPENDED"];

function ReferralNetwork() {
  const [users, setUsers] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [network, setNetwork] = useState([]);

  const [loading, setLoading] = useState(true);
  const [networkLoading, setNetworkLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("ALL");

  const [selectedIds, setSelectedIds] = useState([]);

  const [editUser, setEditUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // --------------------------------------------------
  // LOAD USERS
  // --------------------------------------------------

  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/admin/users`, {
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load users");
      }

      setUsers(
        Array.isArray(data)
          ? data
          : data.users || data.data || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD SHORTLIST
  // --------------------------------------------------

  const loadShortlisted = async () => {
    try {
      const res = await fetch(`${API}/admin/shortlisted-users`, {
        headers,
      });

      const data = await res.json();

      if (!res.ok) return;

      setShortlisted(
        Array.isArray(data)
          ? data
          : data.users || data.data || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadShortlisted();
  }, []);

  // --------------------------------------------------
  // SHORTLIST CHECK
  // --------------------------------------------------

  const isShortlisted = (id) => {
    return shortlisted.some(
      (item) => String(item._id) === String(id)
    );
  };

  // --------------------------------------------------
  // PERFORMANCE VALUES
  // --------------------------------------------------

  const getReferrals = (user) =>
    Number(
      user.directReferrals ??
        user.referrals ??
        user.directReferralCount ??
        0
    );

  const getSales = (user) =>
    Number(
      user.confirmedSales ??
        user.sales ??
        user.totalSales ??
        user.saleAmount ??
        0
    );

  const getOrders = (user) =>
    Number(
      user.ordersCount ??
        user.orderCount ??
        user.totalOrders ??
        0
    );

  // --------------------------------------------------
  // FILTER USERS
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    let result = [...users];

    const q = search.trim().toLowerCase();

    if (q) {
      result = result.filter((user) => {
        const text = [
          user.name,
          user.email,
          user.phone,
          user.city,
          user.district,
          user.state,
          user.pincode,
          user.referralCode,
          user.role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(q);
      });
    }

    if (roleFilter) {
      result = result.filter(
        (user) => user.role === roleFilter
      );
    }

    if (statusFilter) {
      result = result.filter(
        (user) => user.status === statusFilter
      );
    }

    if (locationFilter) {
      const qLocation = locationFilter.toLowerCase();

      result = result.filter((user) =>
        [
          user.city,
          user.district,
          user.state,
          user.pincode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(qLocation)
      );
    }

    if (performanceFilter === "SHORTLISTED") {
      result = result.filter((user) =>
        isShortlisted(user._id)
      );
    }

    if (performanceFilter === "NOT_SHORTLISTED") {
      result = result.filter(
        (user) => !isShortlisted(user._id)
      );
    }

    if (performanceFilter === "TOP_REFERRALS") {
      result.sort(
        (a, b) => getReferrals(b) - getReferrals(a)
      );
    }

    if (performanceFilter === "TOP_SALES") {
      result.sort(
        (a, b) => getSales(b) - getSales(a)
      );
    }

    if (performanceFilter === "TOP_ORDERS") {
      result.sort(
        (a, b) => getOrders(b) - getOrders(a)
      );
    }

    return result;
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    locationFilter,
    performanceFilter,
    shortlisted,
  ]);

  // --------------------------------------------------
  // VIEW USER NETWORK
  // --------------------------------------------------

  const viewNetwork = async (user) => {
    try {
      setSelectedUser(user);
      setNetworkLoading(true);

      const res = await fetch(
        `${API}/users/${user._id}/referrals`,
        {
          headers,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load network"
        );
      }

      setNetwork(
        Array.isArray(data)
          ? data
          : data.referrals ||
              data.members ||
              data.data ||
              []
      );
    } catch (error) {
      console.error(error);
      setNetwork([]);
    } finally {
      setNetworkLoading(false);
    }
  };

  // --------------------------------------------------
  // SELECT USERS
  // --------------------------------------------------

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(
      filteredUsers.map((user) => user._id)
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // --------------------------------------------------
  // SHORTLIST ONE
  // --------------------------------------------------

  const toggleShortlist = async (user) => {
    try {
      const res = await fetch(
        `${API}/admin/users/${user._id}/shortlist`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            shortlisted: !isShortlisted(user._id),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Shortlist failed"
        );
      }

      await loadShortlisted();
    } catch (error) {
      alert(error.message);
    }
  };

  // --------------------------------------------------
  // BULK SHORTLIST
  // --------------------------------------------------

  const bulkShortlist = async () => {
    if (!selectedIds.length) {
      alert("Please select users first.");
      return;
    }

    try {
      for (const id of selectedIds) {
        if (!isShortlisted(id)) {
          await fetch(
            `${API}/admin/users/${id}/shortlist`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                shortlisted: true,
              }),
            }
          );
        }
      }

      await loadShortlisted();
      setSelectedIds([]);

      alert("Selected users shortlisted successfully.");
    } catch (error) {
      console.error(error);
      alert("Bulk shortlist failed.");
    }
  };

  // --------------------------------------------------
  // CHANGE STATUS
  // --------------------------------------------------

  const changeStatus = async (user, status) => {
    try {
      const res = await fetch(
        `${API}/admin/users/${user._id}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Status update failed"
        );
      }

      await loadUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  // --------------------------------------------------
  // CHANGE ROLE
  // --------------------------------------------------

  const changeRole = async (user, role) => {
    try {
      const res = await fetch(
        `${API}/admin/users/${user._id}/role`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ role }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Role update failed"
        );
      }

      await loadUsers();

      if (
        selectedUser &&
        String(selectedUser._id) === String(user._id)
      ) {
        setSelectedUser({
          ...selectedUser,
          role,
        });
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // --------------------------------------------------
  // EDIT USER
  // --------------------------------------------------

  const openEdit = (user) => {
    setEditUser({
      ...user,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      city: user.city || "",
      district: user.district || "",
      state: user.state || "",
      pincode: user.pincode || "",
      address: user.address || "",
      role: user.role || "MEMBER",
      status: user.status || "PENDING",
      teamLeader: user.teamLeader?._id || user.teamLeader || "",
      superTeamLeader:
        user.superTeamLeader?._id ||
        user.superTeamLeader ||
        "",
      sellingTeam:
        user.sellingTeam?._id ||
        user.sellingTeam ||
        "",
    });
  };

  const saveEdit = async () => {
    if (!editUser) return;

    try {
      setEditLoading(true);

      const payload = {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        city: editUser.city,
        district: editUser.district,
        state: editUser.state,
        pincode: editUser.pincode,
        address: editUser.address,
        role: editUser.role,
        status: editUser.status,
        teamLeader:
          editUser.teamLeader || null,
        superTeamLeader:
          editUser.superTeamLeader || null,
        sellingTeam:
          editUser.sellingTeam || null,
      };

      const res = await fetch(
        `${API}/admin/users/${editUser._id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "User update failed"
        );
      }

      setEditUser(null);

      await loadUsers();

      alert("User updated successfully.");
    } catch (error) {
      alert(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (u) => u.status === "ACTIVE"
  ).length;

  const pendingUsers = users.filter(
    (u) => u.status === "PENDING"
  ).length;

  const shortlistedCount = users.filter((u) =>
    isShortlisted(u._id)
  ).length;

  const totalReferrals = users.reduce(
    (sum, user) => sum + getReferrals(user),
    0
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="rn-loading">
        Loading referral network...
      </div>
    );
  }

  return (
    <div className="rn-page">

      {/* HEADER */}

      <div className="rn-header">
        <div>
          <h1>Referral Network</h1>
          <p>
            Manage complete referral hierarchy,
            performance and team structure.
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="rn-summary">

        <div className="rn-stat">
          <span>Total Users</span>
          <strong>{totalUsers}</strong>
        </div>

        <div className="rn-stat">
          <span>Active Users</span>
          <strong>{activeUsers}</strong>
        </div>

        <div className="rn-stat">
          <span>Pending</span>
          <strong>{pendingUsers}</strong>
        </div>

        <div className="rn-stat">
          <span>Total Referrals</span>
          <strong>{totalReferrals}</strong>
        </div>

        <div className="rn-stat">
          <span>Shortlisted</span>
          <strong>{shortlistedCount}</strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="rn-filter-card">

        <input
          type="text"
          placeholder="Search name, phone, referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
        >
          <option value="">All Roles</option>

          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">All Status</option>

          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="State / District / City / Pincode"
          value={locationFilter}
          onChange={(e) =>
            setLocationFilter(e.target.value)
          }
        />

        <select
          value={performanceFilter}
          onChange={(e) =>
            setPerformanceFilter(e.target.value)
          }
        >
          <option value="ALL">
            All Users
          </option>

          <option value="TOP_REFERRALS">
            Top Referrals
          </option>

          <option value="TOP_SALES">
            Top Sales
          </option>

          <option value="TOP_ORDERS">
            Top Orders
          </option>

          <option value="SHORTLISTED">
            Shortlisted
          </option>

          <option value="NOT_SHORTLISTED">
            Not Shortlisted
          </option>
        </select>

      </div>

      {/* BULK ACTIONS */}

      <div className="rn-actions">

        <button
          className="rn-btn"
          onClick={selectAll}
        >
          Select All
        </button>

        <button
          className="rn-btn"
          onClick={clearSelection}
        >
          Clear
        </button>

        <button
          className="rn-btn primary"
          onClick={bulkShortlist}
        >
          ⭐ Shortlist Selected ({selectedIds.length})
        </button>

      </div>

      {/* MAIN AREA */}

      <div className="rn-layout">

        {/* USERS */}

        <div className="rn-table-card">

          <div className="rn-table-scroll">

            <table>

              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 &&
                        selectedIds.length ===
                          filteredUsers.length
                      }
                      onChange={(e) =>
                        e.target.checked
                          ? selectAll()
                          : clearSelection()
                      }
                    />
                  </th>

                  <th>User</th>
                  <th>Role</th>
                  <th>Referrals</th>
                  <th>Sales</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Shortlist</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user._id}>

                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          user._id
                        )}
                        onChange={() =>
                          toggleSelect(user._id)
                        }
                      />
                    </td>

                    <td>
                      <div className="rn-user">
                        <strong>
                          {user.name || "Unnamed"}
                        </strong>

                        <small>
                          {user.referralCode || "-"}
                        </small>
                      </div>
                    </td>

                    <td>

                      <select
                        value={
                          user.role || "MEMBER"
                        }
                        onChange={(e) =>
                          changeRole(
                            user,
                            e.target.value
                          )
                        }
                      >

                        {ROLES.map((role) => (
                          <option
                            key={role}
                            value={role}
                          >
                            {role}
                          </option>
                        ))}

                      </select>

                    </td>

                    <td>
                      <strong>
                        {getReferrals(user)}
                      </strong>
                    </td>

                    <td>
                      ₹{getSales(user).toLocaleString()}
                    </td>

                    <td>
                      {user.city ||
                        user.district ||
                        user.state ||
                        "-"}
                    </td>

                    <td>

                      <select
                        value={
                          user.status || "PENDING"
                        }
                        onChange={(e) =>
                          changeStatus(
                            user,
                            e.target.value
                          )
                        }
                      >

                        {STATUSES.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}

                      </select>

                    </td>

                    <td>

                      <button
                        className={
                          isShortlisted(user._id)
                            ? "rn-star active"
                            : "rn-star"
                        }
                        onClick={() =>
                          toggleShortlist(user)
                        }
                        title={
                          isShortlisted(user._id)
                            ? "Remove shortlist"
                            : "Shortlist"
                        }
                      >
                        {isShortlisted(user._id)
                          ? "★"
                          : "☆"}
                      </button>

                    </td>

                    <td>

                      <div className="rn-row-actions">

                        <button
                          onClick={() =>
                            viewNetwork(user)
                          }
                        >
                          Network
                        </button>

                        <button
                          onClick={() =>
                            openEdit(user)
                          }
                        >
                          Edit
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* NETWORK PANEL */}

        <div className="rn-details">

          {!selectedUser ? (

            <div className="rn-empty">
              <h2>Referral Hierarchy</h2>
              <p>
                Select a user to view their
                complete referral network.
              </p>
            </div>

          ) : (

            <>

              <div className="rn-details-header">

                <div>

                  <h2>
                    {selectedUser.name}
                  </h2>

                  <span>
                    {selectedUser.role}
                  </span>

                </div>

                <button
                  onClick={() =>
                    setSelectedUser(null)
                  }
                >
                  ×
                </button>

              </div>

              <div className="rn-user-info">

                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedUser.phone || "-"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedUser.email || "-"}
                </p>

                <p>
                  <strong>Referral Code:</strong>{" "}
                  {selectedUser.referralCode || "-"}
                </p>

                <p>
                  <strong>Referred By:</strong>{" "}
                  {selectedUser.referredBy?.name ||
                    selectedUser.referredBy ||
                    "-"}
                </p>

                <p>
                  <strong>Direct Referrals:</strong>{" "}
                  {getReferrals(selectedUser)}
                </p>

              </div>

              <h3>
                Direct Referral Team
              </h3>

              {networkLoading ? (

                <p>Loading hierarchy...</p>

              ) : network.length === 0 ? (

                <div className="rn-empty-small">
                  No direct referrals found.
                </div>

              ) : (

                <div className="rn-network-list">

                  {network.map((referral) => (

                    <div
                      className="rn-network-item"
                      key={referral._id}
                    >

                      <div>

                        <strong>
                          {referral.name || "-"}
                        </strong>

                        <small>
                          {referral.phone || "-"}
                        </small>

                      </div>

                      <span>
                        {referral.role || "MEMBER"}
                      </span>

                      <button
                        onClick={() =>
                          viewNetwork(referral)
                        }
                      >
                        Open
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </>

          )}

        </div>

      </div>

      {/* EDIT MODAL */}

      {editUser && (

        <div
          className="rn-modal-overlay"
          onClick={() => setEditUser(null)}
        >

          <div
            className="rn-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="rn-modal-header">

              <h2>Edit User</h2>

              <button
                onClick={() =>
                  setEditUser(null)
                }
              >
                ×
              </button>

            </div>

            <div className="rn-form">

              <label>
                Name
                <input
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Email
                <input
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      email: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Phone
                <input
                  value={editUser.phone}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      phone: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Address
                <input
                  value={editUser.address}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      address: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                City
                <input
                  value={editUser.city}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      city: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                District
                <input
                  value={editUser.district}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      district: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                State
                <input
                  value={editUser.state}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      state: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Pincode
                <input
                  value={editUser.pincode}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      pincode: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Role

                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      role: e.target.value,
                    })
                  }
                >

                  {ROLES.map((role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  ))}

                </select>

              </label>

              <label>
                Status

                <select
                  value={editUser.status}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      status: e.target.value,
                    })
                  }
                >

                  {STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}

                </select>

              </label>

              <label>
                Team Leader ID

                <input
                  value={editUser.teamLeader}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      teamLeader: e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Super Team Leader ID

                <input
                  value={
                    editUser.superTeamLeader
                  }
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      superTeamLeader:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Selling Team ID

                <input
                  value={editUser.sellingTeam}
                  onChange={(e) =>
                    setEditUser({
                      ...editUser,
                      sellingTeam:
                        e.target.value,
                    })
                  }
                />

              </label>

            </div>

            <div className="rn-modal-actions">

              <button
                onClick={() =>
                  setEditUser(null)
                }
              >
                Cancel
              </button>

              <button
                className="primary"
                onClick={saveEdit}
                disabled={editLoading}
              >
                {editLoading
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ReferralNetwork;
