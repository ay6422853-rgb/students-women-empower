import React, { useEffect, useMemo, useState } from "react";
import "./Commissions.css";

const API = "https://students-and-women-empower.onrender.com/api";

const SHORTLIST_KEY = "adminCommissionShortlist";

function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [shortlist, setShortlist] = useState("ALL");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [sortBy, setSortBy] = useState("NEWEST");

  const [selected, setSelected] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(SHORTLIST_KEY) || "[]"
      );
    } catch {
      return [];
    }
  });

  const [selectedCommission, setSelectedCommission] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      setMessage("");

      const params = new URLSearchParams();

      if (fromDate) {
        params.append("fromDate", fromDate);
      }

      if (toDate) {
        params.append("toDate", toDate);
      }

      if (status !== "ALL") {
        params.append("status", status);
      }

      const query = params.toString();

      const data = await request(
        `/admin/commissions${query ? `?${query}` : ""}`
      );

      setCommissions(
        Array.isArray(data)
          ? data
          : data.commissions || data.data || []
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getBeneficiary = (item) =>
    item.beneficiary ||
    item.user ||
    item.to ||
    item.recipient ||
    {};

  const getSourceUser = (item) =>
    item.sourceUser ||
    item.from ||
    item.customer ||
    item.buyer ||
    {};

  const getAmount = (item) =>
    Number(
      item.commissionAmount ??
        item.amount ??
        item.commission ??
        item.value ??
        0
    );

  const getRate = (item) =>
    Number(
      item.commissionRate ??
        item.rate ??
        item.percentage ??
        0
    );

  const getLevel = (item) =>
    item.level ??
    item.commissionLevel ??
    item.generation ??
    "-";

  const getRole = (item) => {
    const beneficiary = getBeneficiary(item);

    return (
      beneficiary.role ||
      item.beneficiaryRole ||
      item.userRole ||
      item.role ||
      "-"
    );
  };

  const isShortlisted = (id) =>
    shortlistedIds.includes(id);

  const saveShortlist = (ids) => {
    setShortlistedIds(ids);
    localStorage.setItem(
      SHORTLIST_KEY,
      JSON.stringify(ids)
    );
  };

  const toggleShortlist = (id) => {
    if (isShortlisted(id)) {
      saveShortlist(
        shortlistedIds.filter((item) => item !== id)
      );
    } else {
      saveShortlist([...shortlistedIds, id]);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    const result = commissions.filter((item) => {
      const beneficiary = getBeneficiary(item);
      const source = getSourceUser(item);

      const beneficiaryName =
        beneficiary.name?.toLowerCase() || "";

      const sourceName =
        source.name?.toLowerCase() || "";

      const beneficiaryPhone =
        beneficiary.phone?.toLowerCase() || "";

      const sourcePhone =
        source.phone?.toLowerCase() || "";

      const orderId =
        item.order?._id?.toLowerCase() ||
        item.order?.orderNumber?.toLowerCase() ||
        "";

      const commissionAmount = getAmount(item);

      const itemLevel = String(getLevel(item));

      const itemRole = getRole(item);

      const matchesSearch =
        !text ||
        beneficiaryName.includes(text) ||
        sourceName.includes(text) ||
        beneficiaryPhone.includes(text) ||
        sourcePhone.includes(text) ||
        orderId.includes(text) ||
        itemLevel.toLowerCase().includes(text);

      const matchesStatus =
        status === "ALL" ||
        item.status === status;

      const matchesRole =
        role === "ALL" ||
        itemRole === role;

      const matchesLevel =
        level === "ALL" ||
        itemLevel === level;

      const matchesShortlist =
        shortlist === "ALL" ||
        (shortlist === "SHORTLISTED" &&
          isShortlisted(item._id)) ||
        (shortlist === "NOT_SHORTLISTED" &&
          !isShortlisted(item._id));

      const matchesMin =
        minAmount === "" ||
        commissionAmount >= Number(minAmount);

      const matchesMax =
        maxAmount === "" ||
        commissionAmount <= Number(maxAmount);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesLevel &&
        matchesShortlist &&
        matchesMin &&
        matchesMax
      );
    });

    return [...result].sort((a, b) => {
      const amountA = getAmount(a);
      const amountB = getAmount(b);

      const rateA = getRate(a);
      const rateB = getRate(b);

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      if (sortBy === "AMOUNT_HIGH") {
        return amountB - amountA;
      }

      if (sortBy === "AMOUNT_LOW") {
        return amountA - amountB;
      }

      if (sortBy === "RATE_HIGH") {
        return rateB - rateA;
      }

      if (sortBy === "RATE_LOW") {
        return rateA - rateB;
      }

      if (sortBy === "OLDEST") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }, [
    commissions,
    search,
    status,
    role,
    level,
    shortlist,
    minAmount,
    maxAmount,
    sortBy,
    shortlistedIds,
  ]);

  const totalAmount = commissions.reduce(
    (sum, item) => sum + getAmount(item),
    0
  );

  const availableAmount = commissions
    .filter((item) => item.status === "AVAILABLE")
    .reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

  const paidAmount = commissions
    .filter((item) => item.status === "PAID")
    .reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

  const pendingAmount = commissions
    .filter((item) => item.status === "PENDING")
    .reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

  const filteredAmount = filtered.reduce(
    (sum, item) => sum + getAmount(item),
    0
  );

  const selectAll = () => {
    setSelected(filtered.map((item) => item._id));
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const bulkShortlist = (value) => {
    const ids = new Set(shortlistedIds);

    selected.forEach((id) => {
      if (value) {
        ids.add(id);
      } else {
        ids.delete(id);
      }
    });

    saveShortlist([...ids]);
    setSelected([]);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setRole("ALL");
    setLevel("ALL");
    setShortlist("ALL");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("NEWEST");
  };

  if (loading) {
    return (
      <div className="commission-loading">
        Loading commissions...
      </div>
    );
  }

  return (
    <div className="commission-page">

      <div className="commission-header">
        <div>
          <h1>Commission Management</h1>
          <p>
            Monitor, filter, sort and shortlist all
            commission records.
          </p>
        </div>

        <button
          className="commission-btn secondary"
          onClick={loadCommissions}
        >
          ↻ Refresh
        </button>
      </div>

      {message && (
        <div className="commission-message">
          {message}
        </div>
      )}

      {/* DATE FILTER */}

      <div className="commission-date-box">
        <div>
          <label>From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
          />
        </div>

        <div>
          <label>To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
          />
        </div>

        <button
          className="commission-btn primary"
          onClick={loadCommissions}
        >
          Apply Date Range
        </button>

        <button
          className="commission-btn secondary"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      {/* STATS */}

      <div className="commission-stats">

        <div className="commission-stat">
          <span>Total Records</span>
          <strong>{commissions.length}</strong>
        </div>

        <div className="commission-stat">
          <span>Total Commission</span>
          <strong>
            ₹{totalAmount.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="commission-stat">
          <span>Available</span>
          <strong>
            ₹{availableAmount.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="commission-stat">
          <span>Pending</span>
          <strong>
            ₹{pendingAmount.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="commission-stat">
          <span>Paid</span>
          <strong>
            ₹{paidAmount.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="commission-stat highlight">
          <span>Filtered Commission</span>
          <strong>
            ₹{filteredAmount.toLocaleString("en-IN")}
          </strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="commission-filters">

        <input
          className="wide-input"
          placeholder="Search beneficiary, source user, phone, order..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
        >
          <option value="ALL">All Roles</option>
          <option value="MEMBER">Member</option>
          <option value="TEAM_LEADER">
            Team Leader
          </option>
          <option value="SUPER_TEAM_LEADER">
            Super Team Leader
          </option>
          <option value="CHIEF_TEAM_OFFICER">
            Chief Team Officer
          </option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          value={level}
          onChange={(e) =>
            setLevel(e.target.value)
          }
        >
          <option value="ALL">All Levels</option>
          <option value="1">Level 1 — 5%</option>
          <option value="2">Level 2 — 3%</option>
          <option value="3">Level 3 — 2%</option>
          <option value="4">Level 4 — 1%</option>
        </select>

        <select
          value={shortlist}
          onChange={(e) =>
            setShortlist(e.target.value)
          }
        >
          <option value="ALL">
            All Shortlist
          </option>
          <option value="SHORTLISTED">
            Shortlisted
          </option>
          <option value="NOT_SHORTLISTED">
            Not Shortlisted
          </option>
        </select>

        <input
          type="number"
          placeholder="Min Amount"
          value={minAmount}
          onChange={(e) =>
            setMinAmount(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Max Amount"
          value={maxAmount}
          onChange={(e) =>
            setMaxAmount(e.target.value)
          }
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="NEWEST">
            Newest First
          </option>
          <option value="OLDEST">
            Oldest First
          </option>
          <option value="AMOUNT_HIGH">
            Commission High → Low
          </option>
          <option value="AMOUNT_LOW">
            Commission Low → High
          </option>
          <option value="RATE_HIGH">
            Rate High → Low
          </option>
          <option value="RATE_LOW">
            Rate Low → High
          </option>
        </select>

      </div>

      {/* BULK ACTIONS */}

      <div className="commission-toolbar">

        <div>
          <strong>
            {filtered.length}
          </strong>{" "}
          records found
        </div>

        <div className="commission-toolbar-actions">

          <button
            className="commission-btn small"
            onClick={selectAll}
          >
            Select All
          </button>

          <button
            className="commission-btn small"
            onClick={clearSelection}
          >
            Clear Selection
          </button>

          {selected.length > 0 && (
            <>
              <button
                className="commission-btn shortlist"
                onClick={() =>
                  bulkShortlist(true)
                }
              >
                ★ Shortlist Selected
              </button>

              <button
                className="commission-btn danger"
                onClick={() =>
                  bulkShortlist(false)
                }
              >
                Remove Shortlist
              </button>
            </>
          )}

          <span className="selected-count">
            Selected: {selected.length}
          </span>

        </div>
      </div>

      {/* TABLE */}

      <div className="commission-table-wrapper">

        <table className="commission-table">

          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    selected.length ===
                      filtered.length
                  }
                  onChange={(e) =>
                    e.target.checked
                      ? selectAll()
                      : clearSelection()
                  }
                />
              </th>

              <th>Shortlist</th>
              <th>Beneficiary</th>
              <th>Role</th>
              <th>Source User</th>
              <th>Order</th>
              <th>Level</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((item) => {

              const beneficiary =
                getBeneficiary(item);

              const source =
                getSourceUser(item);

              return (
                <tr key={item._id}>

                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(
                        item._id
                      )}
                      onChange={() =>
                        toggleSelect(item._id)
                      }
                    />
                  </td>

                  <td>
                    <button
                      className={`star-btn ${
                        isShortlisted(item._id)
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleShortlist(
                          item._id
                        )
                      }
                    >
                      ★
                    </button>
                  </td>

                  <td>
                    <strong>
                      {beneficiary.name || "-"}
                    </strong>

                    {beneficiary.phone && (
                      <small>
                        {beneficiary.phone}
                      </small>
                    )}
                  </td>

                  <td>
                    <span className="role-badge">
                      {getRole(item)}
                    </span>
                  </td>

                  <td>
                    {source.name || "-"}
                  </td>

                  <td>
                    {item.order?._id
                      ? item.order._id.slice(-8)
                      : item.order?.orderNumber ||
                        "-"}
                  </td>

                  <td>
                    <span className="level-badge">
                      L{getLevel(item)}
                    </span>
                  </td>

                  <td>
                    {getRate(item)}%
                  </td>

                  <td className="amount-cell">
                    ₹
                    {getAmount(item).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${String(
                        item.status || ""
                      ).toLowerCase()}`}
                    >
                      {item.status || "-"}
                    </span>
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </td>

                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedCommission(
                          item
                        )
                      }
                    >
                      View
                    </button>
                  </td>

                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="12"
                  className="no-data"
                >
                  No commissions found.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}

      {selectedCommission && (
        <div
          className="commission-modal-overlay"
          onClick={() =>
            setSelectedCommission(null)
          }
        >
          <div
            className="commission-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">
              <div>
                <h2>
                  Commission Details
                </h2>
                <p>
                  Complete commission information
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedCommission(null)
                }
              >
                ×
              </button>
            </div>

            <div className="commission-detail-grid">

              <div>
                <span>Beneficiary</span>
                <strong>
                  {
                    getBeneficiary(
                      selectedCommission
                    ).name || "-"
                  }
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {getRole(
                    selectedCommission
                  )}
                </strong>
              </div>

              <div>
                <span>Source User</span>
                <strong>
                  {
                    getSourceUser(
                      selectedCommission
                    ).name || "-"
                  }
                </strong>
              </div>

              <div>
                <span>Level</span>
                <strong>
                  {getLevel(
                    selectedCommission
                  )}
                </strong>
              </div>

              <div>
                <span>Commission Rate</span>
                <strong>
                  {getRate(
                    selectedCommission
                  )}
                  %
                </strong>
              </div>

              <div>
                <span>Commission Amount</span>
                <strong>
                  ₹
                  {getAmount(
                    selectedCommission
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedCommission.status ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>Order ID</span>
                <strong>
                  {selectedCommission.order?._id ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {selectedCommission.createdAt
                    ? new Date(
                        selectedCommission.createdAt
                      ).toLocaleString("en-IN")
                    : "-"}
                </strong>
              </div>

            </div>

            <div className="modal-footer">

              <button
                className={`commission-btn shortlist ${
                  isShortlisted(
                    selectedCommission._id
                  )
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  toggleShortlist(
                    selectedCommission._id
                  )
                }
              >
                ★{" "}
                {isShortlisted(
                  selectedCommission._id
                )
                  ? "Shortlisted"
                  : "Shortlist"}
              </button>

              <button
                className="commission-btn secondary"
                onClick={() =>
                  setSelectedCommission(null)
                }
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Commissions;
