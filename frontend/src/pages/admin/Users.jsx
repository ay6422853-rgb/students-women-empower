import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.css";
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

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [shortlistedUsers, setShortlistedUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ================================
  // FILTERS
  // ================================

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [pincodeFilter, setPincodeFilter] = useState("");

  // JOINED DATE FILTER
  const [fromJoinedDate, setFromJoinedDate] = useState("");
  const [toJoinedDate, setToJoinedDate] = useState("");

  const [performanceFilter, setPerformanceFilter] = useState("ALL");

  const [selectedIds, setSelectedIds] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showShortlisted, setShowShortlisted] = useState(false);

  const [portfolio, setPortfolio] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem("token");

  // ================================
  // API HELPER
  // ================================

  const request = async (url, options = {}) => {
    const res = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  // ================================
  // LOAD USERS
  // ================================

  const loadUsers = async () => {
    try {
      setLoading(true);

      const data = await request("/admin/users");

      const list = Array.isArray(data)
        ? data
        : data.users || data.data || [];

      setUsers(list);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // LOAD SHORTLISTED
  // ================================

  const loadShortlisted = async () => {
    try {
      const data = await request("/admin/shortlisted-users");

      const list = Array.isArray(data)
        ? data
        : data.users ||
          data.shortlistedUsers ||
          data.data ||
          [];

      setShortlistedUsers(list);
    } catch (error) {
      console.error("Shortlist loading error:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadShortlisted();
  }, []);

  // ================================
  // SHORTLIST CHECK
  // ================================

  const isShortlisted = (userId) => {
    return shortlistedUsers.some(
      (user) => String(user._id) === String(userId)
    );
  };

  // ================================
  // FILTER USERS
  // ================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = search.trim().toLowerCase();

      const searchableText = [
        user.name,
        user.email,
        user.phone,
        user.address,
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

      // SEARCH
      const matchesSearch =
        !text || searchableText.includes(text);

      // ROLE
      const matchesRole =
        role === "ALL" || user.role === role;

      // STATUS
      const matchesStatus =
        status === "ALL" || user.status === status;

      // STATE
      const matchesState =
        !stateFilter ||
        String(user.state || "")
          .toLowerCase()
          .includes(stateFilter.toLowerCase());

      // DISTRICT
      const matchesDistrict =
        !districtFilter ||
        String(user.district || "")
          .toLowerCase()
          .includes(districtFilter.toLowerCase());

      // CITY
      const matchesCity =
        !cityFilter ||
        String(user.city || "")
          .toLowerCase()
          .includes(cityFilter.toLowerCase());

      // PINCODE
      const matchesPincode =
        !pincodeFilter ||
        String(user.pincode || "")
          .toLowerCase()
          .includes(pincodeFilter.toLowerCase());

      // ==========================================
      // JOINED DATE FROM -> TO
      // ==========================================

      const joinedDate = user.createdAt
        ? new Date(user.createdAt)
        : null;

      const matchesJoinedFrom =
        !fromJoinedDate ||
        (joinedDate &&
          joinedDate >=
            new Date(`${fromJoinedDate}T00:00:00`));

      const matchesJoinedTo =
        !toJoinedDate ||
        (joinedDate &&
          joinedDate <=
            new Date(`${toJoinedDate}T23:59:59.999`));

      // ==========================================
      // PERFORMANCE
      // ==========================================

      const sales = Number(
        user.confirmedSales ??
          user.sales ??
          user.totalSales ??
          user.saleAmount ??
          0
      );

      const referrals = Number(
        user.directReferrals ??
          user.referrals ??
          user.directReferralCount ??
          0
      );

      const orders = Number(
        user.ordersCount ??
          user.orderCount ??
          user.totalOrders ??
          0
      );

      let matchesPerformance = true;

      if (performanceFilter === "TOP_SALES") {
        matchesPerformance = sales > 0;
      }

      if (performanceFilter === "TOP_REFERRALS") {
        matchesPerformance = referrals > 0;
      }

      if (performanceFilter === "TOP_ORDERS") {
        matchesPerformance = orders > 0;
      }

      if (performanceFilter === "NEW_USERS") {
        if (!user.createdAt) {
          matchesPerformance = false;
        } else {
          const joined = new Date(user.createdAt);

          const days =
            (Date.now() - joined.getTime()) /
            (1000 * 60 * 60 * 24);

          matchesPerformance = days <= 30;
        }
      }

      if (performanceFilter === "SHORTLISTED") {
        matchesPerformance = isShortlisted(user._id);
      }

      if (performanceFilter === "NOT_SHORTLISTED") {
        matchesPerformance = !isShortlisted(user._id);
      }

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesState &&
        matchesDistrict &&
        matchesCity &&
        matchesPincode &&
        matchesJoinedFrom &&
        matchesJoinedTo &&
        matchesPerformance
      );
    });
  }, [
    users,
    search,
    role,
    status,
    stateFilter,
    districtFilter,
    cityFilter,
    pincodeFilter,
    fromJoinedDate,
    toJoinedDate,
    performanceFilter,
    shortlistedUsers,
  ]);

  // ================================
  // SELECT USER
  // ================================

  const toggleSelectUser = (userId) => {
    setSelectedIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }

      return [...prev, userId];
    });
  };

  const selectAllFiltered = () => {
    const ids = filteredUsers.map((user) => user._id);

    setSelectedIds((prev) => {
      const allSelected = ids.every((id) =>
        prev.includes(id)
      );

      if (allSelected) {
        return prev.filter((id) => !ids.includes(id));
      }

      return [...new Set([...prev, ...ids])];
    });
  };

  // ================================
  // SHORTLIST
  // ================================

  const toggleShortlist = async (user) => {
    try {
      setActionLoading(true);

      const data = await request(
        `/admin/users/${user._id}/shortlist`,
        {
          method: "POST",
          body: JSON.stringify({
            shortlisted: !isShortlisted(user._id),
          }),
        }
      );

      if (isShortlisted(user._id)) {
        setShortlistedUsers((prev) =>
          prev.filter(
            (item) =>
              String(item._id) !== String(user._id)
          )
        );
      } else {
        const returnedUser =
          data.user || data.data || user;

        setShortlistedUsers((prev) => [
          ...prev,
          returnedUser,
        ]);
      }

      await loadShortlisted();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Unable to update shortlist"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ================================
  // BULK SHORTLIST
  // ================================

  const bulkShortlist = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one user.");
      return;
    }

    const usersToShortlist = users.filter((user) =>
      selectedIds.includes(user._id)
    );

    const notShortlisted =
      usersToShortlist.filter(
        (user) => !isShortlisted(user._id)
      );

    if (notShortlisted.length === 0) {
      alert(
        "Selected users are already shortlisted."
      );
      return;
    }

    try {
      setActionLoading(true);

      for (const user of notShortlisted) {
        await request(
          `/admin/users/${user._id}/shortlist`,
          {
            method: "POST",
            body: JSON.stringify({
              shortlisted: true,
            }),
          }
        );
      }

      await loadShortlisted();

      setSelectedIds([]);

      alert(
        `${notShortlisted.length} user(s) shortlisted successfully.`
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Some users could not be shortlisted."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ================================
  // PORTFOLIO
  // ================================

  const openPortfolio = async (user) => {
    try {
      setSelectedUser(user);
      setShowPortfolio(true);
      setPortfolioLoading(true);

      const data = await request(
        `/admin/users/${user._id}/portfolio`
      );

      setPortfolio(
        data.portfolio ||
          data.userPortfolio ||
          data.data ||
          data
      );
    } catch (error) {
      console.error(error);

      setPortfolio(user);

      alert(
        error.message ||
          "Unable to load complete portfolio."
      );
    } finally {
      setPortfolioLoading(false);
    }
  };

  // ================================
  // EDIT USER
  // ================================

  const openEdit = (user) => {
    setSelectedUser(user);

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      district: user.district || "",
      state: user.state || "",
      pincode: user.pincode || "",

      role: user.role || "MEMBER",
      status: user.status || "PENDING",

      category: user.category || "",
      education: user.education || "",
      availability: user.availability || "",

      teamLeader:
        user.teamLeader?._id ||
        user.teamLeader ||
        "",

      superTeamLeader:
        user.superTeamLeader?._id ||
        user.superTeamLeader ||
        "",

      sellingTeam:
        user.sellingTeam?._id ||
        user.sellingTeam ||
        "",
    });

    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      setActionLoading(true);

      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        city: editForm.city,
        district: editForm.district,
        state: editForm.state,
        pincode: editForm.pincode,

        role: editForm.role,
        status: editForm.status,

        category: editForm.category,
        education: editForm.education,
        availability: editForm.availability,

        teamLeader: editForm.teamLeader || null,
        superTeamLeader:
          editForm.superTeamLeader || null,
        sellingTeam:
          editForm.sellingTeam || null,
      };

      const data = await request(
        `/admin/users/${selectedUser._id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      const updatedUser =
        data.user ||
        data.updatedUser ||
        data.data ||
        {
          ...selectedUser,
          ...payload,
        };

      setUsers((prev) =>
        prev.map((user) =>
          String(user._id) ===
          String(selectedUser._id)
            ? {
                ...user,
                ...updatedUser,
              }
            : user
        )
      );

      setSelectedUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      setShowEdit(false);

      alert(
        "User details updated successfully."
      );

      await loadUsers();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Unable to update user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ================================
  // QUICK STATUS
  // ================================

  const changeStatus = async (user, newStatus) => {
    try {
      setActionLoading(true);

      const data = await request(
        `/admin/users/${user._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const updatedUser =
        data.user ||
        data.updatedUser ||
        data.data ||
        {};

      setUsers((prev) =>
        prev.map((item) =>
          String(item._id) === String(user._id)
            ? {
                ...item,
                ...updatedUser,
                status: newStatus,
              }
            : item
        )
      );

      if (selectedUser?._id === user._id) {
        setSelectedUser((prev) => ({
          ...prev,
          ...updatedUser,
          status: newStatus,
        }));
      }
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Unable to change status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ================================
  // QUICK ROLE
  // ================================

  const changeRole = async (user, newRole) => {
    if (!newRole) return;

    try {
      setActionLoading(true);

      const data = await request(
        `/admin/users/${user._id}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const updatedUser =
        data.user ||
        data.updatedUser ||
        data.data ||
        {};

      setUsers((prev) =>
        prev.map((item) =>
          String(item._id) === String(user._id)
            ? {
                ...item,
                ...updatedUser,
                role: newRole,
              }
            : item
        )
      );

      alert("User role updated.");
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Unable to change role."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ================================
  // CLEAR FILTERS
  // ================================

  const clearFilters = () => {
    setSearch("");
    setRole("ALL");
    setStatus("ALL");

    setStateFilter("");
    setDistrictFilter("");
    setCityFilter("");
    setPincodeFilter("");

    setFromJoinedDate("");
    setToJoinedDate("");

    setPerformanceFilter("ALL");
  };

  const showOnlyShortlisted = () => {
    setPerformanceFilter("SHORTLISTED");
  };

  // ================================
  // COUNTS
  // ================================

  const shortlistedCount =
    shortlistedUsers.length;

  const activeCount = users.filter(
    (u) => u.status === "ACTIVE"
  ).length;

  const pendingCount = users.filter(
    (u) => u.status === "PENDING"
  ).length;

  const suspendedCount = users.filter(
    (u) => u.status === "SUSPENDED"
  ).length;

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="admin-users-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  // ================================
  // PAGE
  // ================================

  return (
    <div className="admin-users-page">

      {/* HEADER */}

      <div className="users-page-header">
        <div>
          <h1>Users Management</h1>

          <p>
            Manage, filter, edit and shortlist all
            registered users.
          </p>
        </div>

        <div className="users-header-actions">

          <button
            className="users-btn secondary"
            onClick={() => {
              loadUsers();
              loadShortlisted();
            }}
            disabled={actionLoading}
          >
            ↻ Refresh
          </button>

          <button
            className="users-btn secondary"
            onClick={() =>
              navigate(
                "/dashboard/admin/portfolio"
              )
            }
          >
            📊 Portfolio
          </button>

        </div>
      </div>

      {/* SUMMARY */}

      <div className="users-summary-grid">

        <div className="users-summary-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

        <div className="users-summary-card active">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="users-summary-card pending">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="users-summary-card suspended">
          <span>Suspended</span>
          <strong>{suspendedCount}</strong>
        </div>

        <div
          className="users-summary-card shortlisted-card"
          onClick={() =>
            setShowShortlisted(true)
          }
        >
          <span>Shortlisted</span>
          <strong>{shortlistedCount}</strong>
        </div>

      </div>

      {/* BULK ACTION BAR */}

      <div className="bulk-action-bar">

        <div className="bulk-left">

          <strong>
            {selectedIds.length} Selected
          </strong>

          <button
            className="users-btn small"
            onClick={selectAllFiltered}
          >
            ☑ Select All Visible
          </button>

          <button
            className="users-btn small danger"
            onClick={() =>
              setSelectedIds([])
            }
          >
            Clear Selection
          </button>

        </div>

        <div className="bulk-right">

          <button
            className="users-btn shortlist"
            onClick={bulkShortlist}
            disabled={
              selectedIds.length === 0 ||
              actionLoading
            }
          >
            ⭐ Shortlist Selected
          </button>

          <button
            className="users-btn shortlisted"
            onClick={() =>
              setShowShortlisted(true)
            }
          >
            ⭐ View Shortlisted
          </button>

        </div>

      </div>

      {/* FILTERS */}

      <div className="users-filter-panel">

        <div className="filter-heading">

          <div>
            <h2>Search & Filters</h2>

            <p className="filter-subtitle">
              Filter users by profile, role,
              performance and joining date.
            </p>
          </div>

          <button
            className="users-btn small"
            onClick={clearFilters}
          >
            Clear All
          </button>

        </div>

        <div className="users-filter-grid">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="🔍 Name, phone, email, referral code..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* ROLE */}

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >
            <option value="ALL">
              All Roles
            </option>

            {ROLES.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          {/* STATUS */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="ALL">
              All Status
            </option>

            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* PERFORMANCE */}

          <select
            value={performanceFilter}
            onChange={(e) =>
              setPerformanceFilter(e.target.value)
            }
          >
            <option value="ALL">
              All Users
            </option>

            <option value="SHORTLISTED">
              ⭐ Shortlisted
            </option>

            <option value="NOT_SHORTLISTED">
              ☆ Not Shortlisted
            </option>

            <option value="TOP_SALES">
              💰 Users With Sales
            </option>

            <option value="TOP_REFERRALS">
              👥 Users With Referrals
            </option>

            <option value="TOP_ORDERS">
              📦 Users With Orders
            </option>

            <option value="NEW_USERS">
              🆕 Joined Last 30 Days
            </option>
          </select>

          {/* STATE */}

          <input
            type="text"
            placeholder="State"
            value={stateFilter}
            onChange={(e) =>
              setStateFilter(e.target.value)
            }
          />

          {/* DISTRICT */}

          <input
            type="text"
            placeholder="District"
            value={districtFilter}
            onChange={(e) =>
              setDistrictFilter(e.target.value)
            }
          />

          {/* CITY */}

          <input
            type="text"
            placeholder="City"
            value={cityFilter}
            onChange={(e) =>
              setCityFilter(e.target.value)
            }
          />

          {/* PINCODE */}

          <input
            type="text"
            placeholder="Pincode"
            value={pincodeFilter}
            onChange={(e) =>
              setPincodeFilter(e.target.value)
            }
          />

          {/* =================================
              JOINED FROM
          ================================= */}

          <div className="joined-date-filter">

            <label>
              Joined From
            </label>

            <input
              type="date"
              value={fromJoinedDate}
              onChange={(e) =>
                setFromJoinedDate(
                  e.target.value
                )
              }
            />

          </div>

          {/* =================================
              JOINED TO
          ================================= */}

          <div className="joined-date-filter">

            <label>
              Joined To
            </label>

            <input
              type="date"
              value={toJoinedDate}
              onChange={(e) =>
                setToJoinedDate(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* DATE INFO */}

        {(fromJoinedDate || toJoinedDate) && (
          <div className="joined-date-info">

            📅 Showing users joined

            {fromJoinedDate && (
              <>
                <strong>
                  {" "}
                  from{" "}
                  {new Date(
                    `${fromJoinedDate}T00:00:00`
                  ).toLocaleDateString("en-IN")}
                </strong>
              </>
            )}

            {toJoinedDate && (
              <>
                <strong>
                  {" "}
                  to{" "}
                  {new Date(
                    `${toJoinedDate}T00:00:00`
                  ).toLocaleDateString("en-IN")}
                </strong>
              </>
            )}

          </div>
        )}

      </div>

      {/* RESULTS */}

      <div className="users-results-bar">

        <div>
          Showing{" "}
          <strong>
            {filteredUsers.length}
          </strong>{" "}
          of{" "}
          <strong>
            {users.length}
          </strong>{" "}
          users
        </div>

        {performanceFilter !== "ALL" && (
          <button
            className="users-filter-tag"
            onClick={() =>
              setPerformanceFilter("ALL")
            }
          >
            {performanceFilter.replaceAll(
              "_",
              " "
            )}{" "}
            ×
          </button>
        )}

      </div>

      {/* TABLE */}

      <div className="users-table-wrapper">

        <table className="users-table">

          <thead>
            <tr>

              <th>
                <input
                  type="checkbox"
                  checked={
                    filteredUsers.length > 0 &&
                    filteredUsers.every((user) =>
                      selectedIds.includes(
                        user._id
                      )
                    )
                  }
                  onChange={
                    selectAllFiltered
                  }
                />
              </th>

              <th>User</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Role</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Joined</th>
              <th>Actions</th>

            </tr>
          </thead>

          <tbody>

            {filteredUsers.length === 0 ? (

              <tr>

                <td
                  colSpan="9"
                  className="users-no-data"
                >
                  <div>
                    <span>🔍</span>
                    <h3>No users found</h3>

                    <p>
                      Try changing your filters
                      or search query.
                    </p>
                  </div>
                </td>

              </tr>

            ) : (

              filteredUsers.map((user) => {

                const sales = Number(
                  user.confirmedSales ??
                    user.sales ??
                    user.totalSales ??
                    user.saleAmount ??
                    0
                );

                const referrals = Number(
                  user.directReferrals ??
                    user.referrals ??
                    user.directReferralCount ??
                    0
                );

                const orders = Number(
                  user.ordersCount ??
                    user.orderCount ??
                    user.totalOrders ??
                    0
                );

                return (
                  <tr
                    key={user._id}
                    className={
                      selectedIds.includes(
                        user._id
                      )
                        ? "selected-row"
                        : ""
                    }
                  >

                    {/* SELECT */}

                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          user._id
                        )}
                        onChange={() =>
                          toggleSelectUser(
                            user._id
                          )
                        }
                      />
                    </td>

                    {/* USER */}

                    <td>

                      <div className="user-main-cell">

                        <div className="user-avatar">
                          {user.name
                            ? user.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                        </div>

                        <div>

                          <strong>
                            {user.name || "-"}
                          </strong>

                          {isShortlisted(
                            user._id
                          ) && (
                            <span className="mini-star">
                              ⭐
                            </span>
                          )}

                          <small>
                            ID:{" "}
                            {String(
                              user._id
                            ).slice(-8)}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* CONTACT */}

                    <td>

                      <div className="contact-cell">

                        <span>
                          {user.phone || "-"}
                        </span>

                        <small>
                          {user.email || "-"}
                        </small>

                      </div>

                    </td>

                    {/* LOCATION */}

                    <td>

                      <div className="location-cell">

                        <strong>
                          {user.city || "-"}
                        </strong>

                        <small>
                          {user.district || ""}

                          {user.district &&
                          user.state
                            ? ", "
                            : ""}

                          {user.state || ""}
                        </small>

                        {user.pincode && (
                          <small>
                            PIN: {user.pincode}
                          </small>
                        )}

                      </div>

                    </td>

                    {/* ROLE */}

                    <td>

                      <select
                        className="role-select"
                        value={user.role || ""}
                        onChange={(e) =>
                          changeRole(
                            user,
                            e.target.value
                          )
                        }
                        disabled={
                          actionLoading
                        }
                      >

                        {ROLES.map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item.replaceAll(
                              "_",
                              " "
                            )}
                          </option>
                        ))}

                      </select>

                    </td>

                    {/* STATUS */}

                    <td>

                      <select
                        className={`status-select ${String(
                          user.status || ""
                        ).toLowerCase()}`}
                        value={
                          user.status || ""
                        }
                        onChange={(e) =>
                          changeStatus(
                            user,
                            e.target.value
                          )
                        }
                        disabled={
                          actionLoading
                        }
                      >

                        {STATUSES.map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}

                      </select>

                    </td>

                    {/* PERFORMANCE */}

                    <td>

                      <div className="performance-cell">

                        <span>
                          💰 ₹
                          {sales.toLocaleString()}
                        </span>

                        <span>
                          👥 {referrals} Ref.
                        </span>

                        <span>
                          📦 {orders} Orders
                        </span>

                      </div>

                    </td>

                    {/* JOINED */}

                    <td>

                      <div className="joined-cell">

                        <strong>
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </strong>

                        {user.createdAt && (
                          <small>
                            {new Date(
                              user.createdAt
                            ).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </small>
                        )}

                      </div>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="user-actions">

                        <button
                          className="action-btn portfolio"
                          onClick={() =>
                            openPortfolio(user)
                          }
                        >
                          Portfolio
                        </button>

                        <button
                          className="action-btn edit"
                          onClick={() =>
                            openEdit(user)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className={`action-btn ${
                            isShortlisted(
                              user._id
                            )
                              ? "remove-shortlist"
                              : "shortlist"
                          }`}
                          onClick={() =>
                            toggleShortlist(user)
                          }
                          disabled={
                            actionLoading
                          }
                        >
                          {isShortlisted(
                            user._id
                          )
                            ? "★ Remove"
                            : "☆ Shortlist"}
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

      {/* ================================
          PORTFOLIO MODAL
      ================================= */}

      {showPortfolio &&
        selectedUser && (

          <div
            className="users-modal-overlay"
            onClick={() =>
              setShowPortfolio(false)
            }
          >

            <div
              className="users-portfolio-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    User Portfolio
                  </h2>

                  <p>
                    Complete user information
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowPortfolio(false)
                  }
                >
                  ✕
                </button>

              </div>

              {portfolioLoading ? (

                <div className="portfolio-loading">
                  Loading portfolio...
                </div>

              ) : (

                <>

                  <div className="portfolio-profile">

                    <div className="large-avatar">
                      {selectedUser.name
                        ? selectedUser.name
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </div>

                    <div>

                      <h2>
                        {selectedUser.name ||
                          "-"}
                      </h2>

                      <p>
                        {selectedUser.role ||
                          "MEMBER"}
                      </p>

                      <span
                        className={`status-badge ${String(
                          selectedUser.status ||
                            ""
                        ).toLowerCase()}`}
                      >
                        {selectedUser.status ||
                          "-"}
                      </span>

                    </div>

                  </div>

                  <PortfolioSection
                    title="Basic Information"
                    items={[
                      [
                        "Name",
                        selectedUser.name,
                      ],
                      [
                        "Email",
                        selectedUser.email,
                      ],
                      [
                        "Phone",
                        selectedUser.phone,
                      ],
                      [
                        "Category",
                        selectedUser.category,
                      ],
                      [
                        "Education",
                        selectedUser.education,
                      ],
                      [
                        "Availability",
                        selectedUser.availability,
                      ],
                      [
                        "Joined Date",
                        selectedUser.createdAt
                          ? new Date(
                              selectedUser.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )
                          : "-",
                      ],
                    ]}
                  />

                  <PortfolioSection
                    title="Address"
                    items={[
                      [
                        "Address",
                        selectedUser.address,
                      ],
                      [
                        "City",
                        selectedUser.city,
                      ],
                      [
                        "District",
                        selectedUser.district,
                      ],
                      [
                        "State",
                        selectedUser.state,
                      ],
                      [
                        "Pincode",
                        selectedUser.pincode,
                      ],
                    ]}
                  />

                  <PortfolioSection
                    title="Network"
                    items={[
                      [
                        "Referral Code",
                        selectedUser.referralCode,
                      ],
                      [
                        "Referred By",
                        selectedUser.referredBy
                          ?.name ||
                          selectedUser.referredBy ||
                          "-",
                      ],
                      [
                        "Team Leader",
                        selectedUser.teamLeader
                          ?.name ||
                          selectedUser.teamLeader ||
                          "-",
                      ],
                      [
                        "Super Team Leader",
                        selectedUser
                          .superTeamLeader
                          ?.name ||
                          selectedUser.superTeamLeader ||
                          "-",
                      ],
                    ]}
                  />

                  {portfolio && (
                    <PortfolioSection
                      title="Portfolio / Business Data"
                      items={[
                        [
                          "Total Sales",
                          portfolio.totalSales ??
                            portfolio.sales ??
                            "-",
                        ],
                        [
                          "Total Orders",
                          portfolio.totalOrders ??
                            portfolio.orders?.length ??
                            "-",
                        ],
                        [
                          "Total Commission",
                          portfolio.totalCommission ??
                            "-",
                        ],
                        [
                          "Wallet Balance",
                          portfolio.wallet
                            ?.balance ??
                            portfolio.walletBalance ??
                            "-",
                        ],
                        [
                          "Withdrawals",
                          portfolio.withdrawals
                            ?.length ??
                            "-",
                        ],
                        [
                          "Direct Referrals",
                          portfolio.referrals
                            ?.length ??
                            "-",
                        ],
                      ]}
                    />
                  )}

                </>
              )}

              <div className="modal-footer">

                <button
                  className="users-btn secondary"
                  onClick={() =>
                    setShowPortfolio(false)
                  }
                >
                  Close
                </button>

                <button
                  className="users-btn primary"
                  onClick={() => {
                    setShowPortfolio(false);
                    openEdit(selectedUser);
                  }}
                >
                  Edit User
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ================================
          EDIT MODAL
      ================================= */}

      {showEdit &&
        selectedUser && (

          <div
            className="users-modal-overlay"
            onClick={() =>
              setShowEdit(false)
            }
          >

            <div
              className="users-edit-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>Edit User</h2>

                  <p>
                    All changes will be saved to
                    database.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowEdit(false)
                  }
                >
                  ✕
                </button>

              </div>

              <form onSubmit={saveEdit}>

                <div className="edit-section">

                  <h3>
                    Personal Information
                  </h3>

                  <div className="edit-grid">

                    <FormInput
                      label="Name"
                      name="name"
                      value={editForm.name}
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Category"
                      name="category"
                      value={
                        editForm.category
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Education"
                      name="education"
                      value={
                        editForm.education
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Availability"
                      name="availability"
                      value={
                        editForm.availability
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                </div>

                <div className="edit-section">

                  <h3>Address</h3>

                  <div className="edit-grid">

                    <FormInput
                      label="City"
                      name="city"
                      value={editForm.city}
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="District"
                      name="district"
                      value={
                        editForm.district
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="State"
                      name="state"
                      value={editForm.state}
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Pincode"
                      name="pincode"
                      value={
                        editForm.pincode
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <div className="form-field full">

                      <label>
                        Address
                      </label>

                      <textarea
                        name="address"
                        value={
                          editForm.address ||
                          ""
                        }
                        onChange={
                          handleEditChange
                        }
                        rows="3"
                      />

                    </div>

                  </div>

                </div>

                <div className="edit-section">

                  <h3>
                    Account Management
                  </h3>

                  <div className="edit-grid">

                    <div className="form-field">

                      <label>
                        Role
                      </label>

                      <select
                        name="role"
                        value={
                          editForm.role || ""
                        }
                        onChange={
                          handleEditChange
                        }
                      >

                        {ROLES.map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item.replaceAll(
                              "_",
                              " "
                            )}
                          </option>
                        ))}

                      </select>

                    </div>

                    <div className="form-field">

                      <label>
                        Status
                      </label>

                      <select
                        name="status"
                        value={
                          editForm.status || ""
                        }
                        onChange={
                          handleEditChange
                        }
                      >

                        {STATUSES.map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}

                      </select>

                    </div>

                  </div>

                </div>

                <div className="edit-section">

                  <h3>
                    Team Hierarchy
                  </h3>

                  <p className="form-help">
                    IDs use kar sakte ho. Agar
                    User model me hierarchy fields
                    ObjectId hain to corresponding
                    user ID enter karo.
                  </p>

                  <div className="edit-grid">

                    <FormInput
                      label="Team Leader ID"
                      name="teamLeader"
                      value={
                        editForm.teamLeader
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Super Team Leader ID"
                      name="superTeamLeader"
                      value={
                        editForm.superTeamLeader
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Selling Team ID"
                      name="sellingTeam"
                      value={
                        editForm.sellingTeam
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="users-btn secondary"
                    onClick={() =>
                      setShowEdit(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="users-btn primary"
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* ================================
          SHORTLIST MODAL
      ================================= */}

      {showShortlisted && (

        <div
          className="users-modal-overlay"
          onClick={() =>
            setShowShortlisted(false)
          }
        >

          <div
            className="users-shortlist-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  ⭐ Shortlisted Users
                </h2>

                <p>
                  Users selected by Admin
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowShortlisted(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="shortlist-toolbar">

              <strong>
                {shortlistedUsers.length} Users
              </strong>

              <button
                className="users-btn small"
                onClick={loadShortlisted}
              >
                ↻ Refresh
              </button>

            </div>

            {shortlistedUsers.length === 0 ? (

              <div className="empty-shortlist">

                <div>☆</div>

                <h3>
                  No users shortlisted
                </h3>

                <p>
                  Select users from the table
                  and click Shortlist.
                </p>

              </div>

            ) : (

              <div className="shortlist-list">

                {shortlistedUsers.map(
                  (user) => (

                    <div
                      className="shortlist-user"
                      key={user._id}
                    >

                      <div className="shortlist-avatar">

                        {user.name
                          ? user.name
                              .charAt(0)
                              .toUpperCase()
                          : "U"}

                      </div>

                      <div className="shortlist-info">

                        <strong>
                          {user.name || "-"}
                        </strong>

                        <span>
                          {user.phone || "-"}
                        </span>

                        <small>
                          {user.city || "-"}
                          {user.state
                            ? `, ${user.state}`
                            : ""}
                        </small>

                      </div>

                      <div className="shortlist-actions">

                        <button
                          className="action-btn portfolio"
                          onClick={() => {
                            setShowShortlisted(
                              false
                            );

                            openPortfolio(user);
                          }}
                        >
                          Portfolio
                        </button>

                        <button
                          className="action-btn remove-shortlist"
                          onClick={() =>
                            toggleShortlist(
                              user
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================
// PORTFOLIO SECTION
// ============================================

function PortfolioSection({
  title,
  items,
}) {
  return (
    <div className="portfolio-section">

      <h3>{title}</h3>

      <div className="portfolio-grid">

        {items.map(([label, value]) => (

          <div
            className="portfolio-item"
            key={label}
          >

            <span>{label}</span>

            <strong>
              {value === null ||
              value === undefined ||
              value === ""
                ? "-"
                : String(value)}
            </strong>

          </div>

        ))}

      </div>

    </div>
  );
}

// ============================================
// FORM INPUT
// ============================================

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="form-field">

      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
      />

    </div>
  );
}

export default AdminUsers;
