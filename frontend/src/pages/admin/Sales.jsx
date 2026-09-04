import React, { useEffect, useMemo, useState } from "react";
import "./Sales.css";

const API = "http://localhost:5000/api";

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

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");

  const [minSales, setMinSales] = useState("");
  const [maxSales, setMaxSales] = useState("");

  const [sortBy, setSortBy] = useState("SALES_HIGH");

  const [shortlisted, setShortlisted] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("admin_sales_shortlisted") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [selected, setSelected] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem("token");

  const request = async (url, options = {}) => {
    const res = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  const loadSales = async () => {
    try {
      setLoading(true);

      /*
       * Backend admin sales endpoint:
       * GET /api/admin/sales
       *
       * Agar abhi backend mein /admin/sales route nahi hai,
       * neeche diya backend code add karna hoga.
       */
      const data = await request(
        `/admin/sales?period=${period}`
      );

      setSales(
        Array.isArray(data)
          ? data
          : data.sales ||
            data.users ||
            data.data ||
            []
      );
    } catch (error) {
      console.error("Sales loading error:", error);

      /*
       * Temporary fallback:
       * Agar backend /admin/sales available nahi hai,
       * users endpoint se data load karenge.
       */
      try {
        const data = await request("/admin/users");

        const users =
          Array.isArray(data)
            ? data
            : data.users || data.data || [];

        setSales(
          users.map((user) => ({
            ...user,
            salesAmount:
              Number(user.confirmedSales || user.sales || 0),
            salesQuantity:
              Number(user.salesQuantity || 0),
            orders:
              Number(user.confirmedOrders || user.orders || 0),
            averageOrderValue:
              Number(user.averageOrderValue || 0),
          }))
        );
      } catch (fallbackError) {
        console.error(fallbackError);
        setSales([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [period]);

  const getId = (item) => item._id || item.id;

  const getName = (item) =>
    item.name ||
    item.user?.name ||
    item.seller?.name ||
    item.owner?.name ||
    "-";

  const getPhone = (item) =>
    item.phone ||
    item.user?.phone ||
    item.seller?.phone ||
    "-";

  const getRole = (item) =>
    item.role ||
    item.user?.role ||
    item.seller?.role ||
    "MEMBER";

  const getSales = (item) =>
    Number(
      item.salesAmount ??
        item.totalSales ??
        item.confirmedSales ??
        item.sales ??
        item.totalAmount ??
        item.revenue ??
        0
    );

  const getQuantity = (item) =>
    Number(
      item.salesQuantity ??
        item.quantity ??
        item.totalQuantitySold ??
        item.unitsSold ??
        0
    );

  const getOrders = (item) =>
    Number(
      item.orders ??
        item.totalOrders ??
        item.confirmedOrders ??
        item.orderCount ??
        0
    );

  const getAverageOrder = (item) => {
    const direct = Number(
      item.averageOrderValue ??
        item.avgOrderValue ??
        0
    );

    if (direct > 0) return direct;

    const orderCount = getOrders(item);
    return orderCount > 0
      ? getSales(item) / orderCount
      : 0;
  };

  const isShortlisted = (id) =>
    shortlisted.includes(id);

  const toggleShortlist = (id) => {
    let updated;

    if (shortlisted.includes(id)) {
      updated = shortlisted.filter((x) => x !== id);
    } else {
      updated = [...shortlisted, id];
    }

    setShortlisted(updated);

    localStorage.setItem(
      "admin_sales_shortlisted",
      JSON.stringify(updated)
    );
  };

  

  const bulkShortlist = () => {
    const updated = [
      ...new Set([
        ...shortlisted,
        ...selected,
      ]),
    ];

    setShortlisted(updated);

    localStorage.setItem(
      "admin_sales_shortlisted",
      JSON.stringify(updated)
    );

    setSelected([]);
  };

  const removeSelectedShortlist = () => {
    const updated = shortlisted.filter(
      (id) => !selected.includes(id)
    );

    setShortlisted(updated);

    localStorage.setItem(
      "admin_sales_shortlisted",
      JSON.stringify(updated)
    );

    setSelected([]);
  };

  const filteredSales = useMemo(() => {
    let result = sales.filter((item) => {
      const name = getName(item).toLowerCase();
      const phone = getPhone(item).toLowerCase();
      const itemRole = getRole(item);
      const itemState = (
        item.state ||
        item.user?.state ||
        ""
      ).toLowerCase();

      const itemDistrict = (
        item.district ||
        item.user?.district ||
        ""
      ).toLowerCase();

      const itemCity = (
        item.city ||
        item.user?.city ||
        ""
      ).toLowerCase();

      const searchText = search.toLowerCase();

      const salesAmount = getSales(item);

      const matchesSearch =
        !search ||
        name.includes(searchText) ||
        phone.includes(searchText) ||
        String(getId(item))
          .toLowerCase()
          .includes(searchText);

      const matchesRole =
        role === "ALL" || itemRole === role;

      const matchesStatus =
        status === "ALL" ||
        String(item.status || "").toUpperCase() === status;

      const matchesState =
        !state || itemState.includes(state.toLowerCase());

      const matchesDistrict =
        !district ||
        itemDistrict.includes(district.toLowerCase());

      const matchesCity =
        !city ||
        itemCity.includes(city.toLowerCase());

      const matchesMin =
        !minSales ||
        salesAmount >= Number(minSales);

      const matchesMax =
        !maxSales ||
        salesAmount <= Number(maxSales);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesState &&
        matchesDistrict &&
        matchesCity &&
        matchesMin &&
        matchesMax
      );
    });

    if (sortBy === "SALES_HIGH") {
      result.sort((a, b) => getSales(b) - getSales(a));
    }

    if (sortBy === "SALES_LOW") {
      result.sort((a, b) => getSales(a) - getSales(b));
    }

    if (sortBy === "QUANTITY_HIGH") {
      result.sort(
        (a, b) => getQuantity(b) - getQuantity(a)
      );
    }

    if (sortBy === "QUANTITY_LOW") {
      result.sort(
        (a, b) => getQuantity(a) - getQuantity(b)
      );
    }

    if (sortBy === "ORDERS_HIGH") {
      result.sort(
        (a, b) => getOrders(b) - getOrders(a)
      );
    }

    if (sortBy === "ORDERS_LOW") {
      result.sort(
        (a, b) => getOrders(a) - getOrders(b)
      );
    }

    if (sortBy === "AOV_HIGH") {
      result.sort(
        (a, b) =>
          getAverageOrder(b) -
          getAverageOrder(a)
      );
    }

    if (sortBy === "AOV_LOW") {
      result.sort(
        (a, b) =>
          getAverageOrder(a) -
          getAverageOrder(b)
      );
    }

    if (sortBy === "NAME") {
      result.sort((a, b) =>
        getName(a).localeCompare(getName(b))
      );
    }

    if (sortBy === "SHORTLISTED") {
      result = result.filter((item) =>
        isShortlisted(getId(item))
      );
    }

    if (sortBy === "NOT_SHORTLISTED") {
      result = result.filter(
        (item) => !isShortlisted(getId(item))
      );
    }

    return result;
  }, [
    sales,
    search,
    role,
    status,
    state,
    district,
    city,
    minSales,
    maxSales,
    sortBy,
    shortlisted,
  ]);

  const summary = useMemo(() => {
    const totalSales = filteredSales.reduce(
      (sum, item) => sum + getSales(item),
      0
    );

    const totalQuantity = filteredSales.reduce(
      (sum, item) => sum + getQuantity(item),
      0
    );

    const totalOrders = filteredSales.reduce(
      (sum, item) => sum + getOrders(item),
      0
    );

    const average =
      totalOrders > 0
        ? totalSales / totalOrders
        : 0;

    const topSeller = [...filteredSales].sort(
      (a, b) => getSales(b) - getSales(a)
    )[0];

    return {
      users: filteredSales.length,
      totalSales,
      totalQuantity,
      totalOrders,
      average,
      topSeller,
    };
  }, [filteredSales]);

  const selectAll = () => {
    if (
      selected.length === filteredSales.length &&
      filteredSales.length > 0
    ) {
      setSelected([]);
    } else {
      setSelected(
        filteredSales.map((item) => getId(item))
      );
    }
  };

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="sales-loading">
        Loading sales...
      </div>
    );
  }

  return (
    <div className="sales-page">

      {/* HEADER */}

      <div className="sales-header">
        <div>
          <h1>Sales Management</h1>
          <p>
            Analyze, filter, sort and shortlist sales
            performance.
          </p>
        </div>

        <button
          className="sales-btn secondary"
          onClick={loadSales}
        >
          ↻ Refresh
        </button>
      </div>

      {/* PERIOD */}

      <div className="period-box">
        <div className="period-title">
          Sales Period
        </div>

        <div className="period-buttons">

          {[
            ["ALL", "All Time"],
            ["DAILY", "Daily"],
            ["WEEKLY", "Weekly"],
            ["MONTHLY", "Monthly"],
            ["QUARTERLY", "Quarterly"],
            ["HALF_YEARLY", "Half Yearly"],
            ["YEARLY", "Yearly"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={
                period === value
                  ? "period-btn active"
                  : "period-btn"
              }
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}

        </div>
      </div>

      {/* SUMMARY */}

      <div className="sales-summary">

        <div className="sales-card">
          <span>Total Users</span>
          <strong>{summary.users}</strong>
        </div>

        <div className="sales-card">
          <span>Total Sales</span>
          <strong>{money(summary.totalSales)}</strong>
        </div>

        <div className="sales-card">
          <span>Total Quantity</span>
          <strong>
            {summary.totalQuantity.toLocaleString()}
          </strong>
        </div>

        <div className="sales-card">
          <span>Total Orders</span>
          <strong>
            {summary.totalOrders.toLocaleString()}
          </strong>
        </div>

        <div className="sales-card">
          <span>Average Order</span>
          <strong>
            {money(summary.average)}
          </strong>
        </div>

        <div className="sales-card highlight">
          <span>Top Seller</span>
          <strong>
            {summary.topSeller
              ? getName(summary.topSeller)
              : "-"}
          </strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="sales-filter-panel">

        <input
          placeholder="Search user, phone, ID..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
        >
          <option value="ALL">
            All Roles
          </option>

          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="ALL">
            All Status
          </option>
          <option value="ACTIVE">
            Active
          </option>
          <option value="PENDING">
            Pending
          </option>
          <option value="SUSPENDED">
            Suspended
          </option>
        </select>

        <input
          placeholder="State"
          value={state}
          onChange={(e) =>
            setState(e.target.value)
          }
        />

        <input
          placeholder="District"
          value={district}
          onChange={(e) =>
            setDistrict(e.target.value)
          }
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Min Sales ₹"
          value={minSales}
          onChange={(e) =>
            setMinSales(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Max Sales ₹"
          value={maxSales}
          onChange={(e) =>
            setMaxSales(e.target.value)
          }
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="SALES_HIGH">
            Sales: High → Low
          </option>

          <option value="SALES_LOW">
            Sales: Low → High
          </option>

          <option value="QUANTITY_HIGH">
            Quantity: High → Low
          </option>

          <option value="QUANTITY_LOW">
            Quantity: Low → High
          </option>

          <option value="ORDERS_HIGH">
            Orders: High → Low
          </option>

          <option value="ORDERS_LOW">
            Orders: Low → High
          </option>

          <option value="AOV_HIGH">
            Avg Order: High → Low
          </option>

          <option value="AOV_LOW">
            Avg Order: Low → High
          </option>

          <option value="SHORTLISTED">
            Shortlisted Only
          </option>

          <option value="NOT_SHORTLISTED">
            Not Shortlisted
          </option>

          <option value="NAME">
            Name A → Z
          </option>
        </select>

      </div>

      {/* BULK ACTIONS */}

      <div className="bulk-bar">

        <div>
          <b>{filteredSales.length}</b>{" "}
          users found
        </div>

        <div className="bulk-actions">

          <button
            className="sales-btn"
            onClick={selectAll}
          >
            {selected.length === filteredSales.length
              ? "Clear Selection"
              : "Select All"}
          </button>

          <button
            className="sales-btn success"
            disabled={selected.length === 0}
            onClick={bulkShortlist}
          >
            ★ Shortlist Selected
          </button>

          <button
            className="sales-btn danger"
            disabled={selected.length === 0}
            onClick={removeSelectedShortlist}
          >
            Remove Shortlist
          </button>

        </div>
      </div>

      {/* TABLE */}

      <div className="sales-table-wrapper">

        <table className="sales-table">

          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    filteredSales.length > 0 &&
                    selected.length ===
                      filteredSales.length
                  }
                  onChange={selectAll}
                />
              </th>

              <th>Rank</th>
              <th>User</th>
              <th>Role</th>
              <th>Location</th>
              <th>Sales</th>
              <th>Quantity</th>
              <th>Orders</th>
              <th>Avg Order</th>
              <th>Shortlist</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredSales.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="no-sales"
                >
                  No sales data found.
                </td>
              </tr>
            ) : (
              filteredSales.map((item, index) => {

                const id = getId(item);

                return (
                  <tr key={id}>

                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(id)}
                        onChange={() =>
                          toggleSelected(id)
                        }
                      />
                    </td>

                    <td>
                      <span className="rank">
                        #{index + 1}
                      </span>
                    </td>

                    <td>
                      <div className="user-name">
                        {getName(item)}
                      </div>

                      <small>
                        {getPhone(item)}
                      </small>
                    </td>

                    <td>
                      <span className="role-badge">
                        {getRole(item)}
                      </span>
                    </td>

                    <td>
                      {item.city ||
                        item.user?.city ||
                        "-"}
                      <br />

                      <small>
                        {item.district ||
                          item.user?.district ||
                          "-"}
                      </small>
                    </td>

                    <td className="sales-money">
                      {money(getSales(item))}
                    </td>

                    <td>
                      {getQuantity(item).toLocaleString()}
                    </td>

                    <td>
                      {getOrders(item).toLocaleString()}
                    </td>

                    <td>
                      {money(
                        getAverageOrder(item)
                      )}
                    </td>

                    <td>
                      <button
                        className={
                          isShortlisted(id)
                            ? "star active"
                            : "star"
                        }
                        onClick={() =>
                          toggleShortlist(id)
                        }
                        title={
                          isShortlisted(id)
                            ? "Remove shortlist"
                            : "Shortlist"
                        }
                      >
                        ★
                      </button>
                    </td>

                    <td>
                      <button
                        className="sales-btn small"
                        onClick={() =>
                          setSelectedUser(item)
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

      {/* USER DETAIL MODAL */}

      {selectedUser && (
        <div
          className="sales-modal-overlay"
          onClick={() =>
            setSelectedUser(null)
          }
        >
          <div
            className="sales-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">
              <div>
                <h2>
                  {getName(selectedUser)}
                </h2>

                <span>
                  {getRole(selectedUser)}
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

            <div className="modal-grid">

              <div>
                <label>Phone</label>
                <strong>
                  {getPhone(selectedUser)}
                </strong>
              </div>

              <div>
                <label>Sales</label>
                <strong>
                  {money(
                    getSales(selectedUser)
                  )}
                </strong>
              </div>

              <div>
                <label>Quantity Sold</label>
                <strong>
                  {getQuantity(
                    selectedUser
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <label>Total Orders</label>
                <strong>
                  {getOrders(
                    selectedUser
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <label>Average Order</label>
                <strong>
                  {money(
                    getAverageOrder(
                      selectedUser
                    )
                  )}
                </strong>
              </div>

              <div>
                <label>Status</label>
                <strong>
                  {selectedUser.status || "-"}
                </strong>
              </div>

              <div>
                <label>State</label>
                <strong>
                  {selectedUser.state ||
                    selectedUser.user?.state ||
                    "-"}
                </strong>
              </div>

              <div>
                <label>District</label>
                <strong>
                  {selectedUser.district ||
                    selectedUser.user?.district ||
                    "-"}
                </strong>
              </div>

            </div>

            <button
              className={
                isShortlisted(
                  getId(selectedUser)
                )
                  ? "sales-btn danger full"
                  : "sales-btn success full"
              }
              onClick={() => {
                toggleShortlist(
                  getId(selectedUser)
                );
                setSelectedUser(null);
              }}
            >
              {isShortlisted(
                getId(selectedUser)
              )
                ? "Remove from Shortlist"
                : "★ Add to Shortlist"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Sales;