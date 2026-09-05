import React, { useEffect, useMemo, useState } from "react";
import "./CashTransactions.css";

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

const TRANSACTION_TYPES = [
  {
    value: "MEMBER_TO_TEAM_LEADER",
    label: "Member → Team Leader",
  },
  {
    value: "TEAM_LEADER_TO_CASH_MANAGER",
    label: "Team Leader → Cash Manager",
  },
  {
    value: "CASH_MANAGER_TO_ADMIN",
    label: "Cash Manager → Admin",
  },
];

function CashTransactions() {
  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [fromRole, setFromRole] = useState("ALL");
  const [toRole, setToRole] = useState("ALL");

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [sortBy, setSortBy] = useState("NEWEST");
  const [shortlistOnly, setShortlistOnly] = useState("ALL");

  const [shortlisted, setShortlisted] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "adminCashTransactionShortlist"
        ) || "[]"
      );
    } catch {
      return [];
    }
  });

  const [selected, setSelected] = useState([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // ======================================================
  // API REQUEST
  // ======================================================

  const request = async (url, options = {}) => {
    const res = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    let data = {};

    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(
        data.message || "Request failed"
      );
    }

    return data;
  };

  // ======================================================
  // LOAD CASH TRANSACTIONS
  // ======================================================

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setMessage("");

      /*
       * This is HISTORY only.
       *
       * CashTransactions page does NOT modify
       * Commission Wallet or CashWallet.
       *
       * CashWallet balance changes are handled by
       * cashController approval/collection logic.
       */

      const data = await request(
        "/admin/cash-transactions"
      );

      const list = Array.isArray(data)
        ? data
        : data.transactions ||
          data.data ||
          data.cashTransactions ||
          [];

      setTransactions(list);

      // Remove selections that no longer exist
      setSelected((prev) =>
        prev.filter((id) =>
          list.some(
            (item) => item._id === id
          )
        )
      );
    } catch (error) {
      console.error(
        "Cash transactions error:",
        error
      );

      setMessage(error.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // ======================================================
  // USER HELPERS
  // ======================================================

  const getUser = (item, side) => {
    if (side === "from") {
      return (
        item.from ||
        item.sender ||
        item.sourceUser ||
        {}
      );
    }

    return (
      item.to ||
      item.receiver ||
      item.targetUser ||
      {}
    );
  };

  const getAmount = (item) =>
    Number(
      item.amount ||
        item.totalAmount ||
        item.value ||
        0
    );

  const getDate = (item) =>
    item.createdAt ||
    item.date ||
    item.transactionDate ||
    null;

  const getOrderId = (item) =>
    item.order?._id ||
    item.order?.id ||
    item.order ||
    item.orderId ||
    null;

  // ======================================================
  // DISPLAY HELPERS
  // ======================================================

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  const formatType = (value) => {
    if (!value) return "-";

    const found = TRANSACTION_TYPES.find(
      (item) => item.value === value
    );

    if (found) return found.label;

    return String(value)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN");
  };

  // ======================================================
  // SHORTLIST
  // ======================================================

  const isShortlisted = (id) =>
    shortlisted.includes(id);

  const toggleShortlist = (id) => {
    if (!id) return;

    setShortlisted((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      localStorage.setItem(
        "adminCashTransactionShortlist",
        JSON.stringify(next)
      );

      return next;
    });
  };

  // ======================================================
  // SELECTION
  // ======================================================

  const toggleSelect = (id) => {
    if (!id) return;

    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(
      filtered
        .map((item) => item._id)
        .filter(Boolean)
    );
  };

  const clearSelection = () => {
    setSelected([]);
  };

  // ======================================================
  // BULK SHORTLIST
  // ======================================================

  const bulkShortlist = (value) => {
    setShortlisted((prev) => {
      let next;

      if (value) {
        next = Array.from(
          new Set([
            ...prev,
            ...selected,
          ])
        );
      } else {
        next = prev.filter(
          (id) =>
            !selected.includes(id)
        );
      }

      localStorage.setItem(
        "adminCashTransactionShortlist",
        JSON.stringify(next)
      );

      return next;
    });

    setSelected([]);
  };

  // ======================================================
  // FILTER + SORT
  // ======================================================

  const filtered = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    const result =
      transactions.filter((item) => {
        const fromUser =
          getUser(item, "from");

        const toUser =
          getUser(item, "to");

        const fromName = String(
          fromUser.name || ""
        ).toLowerCase();

        const toName = String(
          toUser.name || ""
        ).toLowerCase();

        const fromPhone = String(
          fromUser.phone || ""
        ).toLowerCase();

        const toPhone = String(
          toUser.phone || ""
        ).toLowerCase();

        const fromEmail = String(
          fromUser.email || ""
        ).toLowerCase();

        const toEmail = String(
          toUser.email || ""
        ).toLowerCase();

        const transactionId =
          String(
            item._id || ""
          ).toLowerCase();

        const transactionId2 =
          String(
            item.transactionId || ""
          ).toLowerCase();

        const orderId =
          String(
            getOrderId(item) || ""
          ).toLowerCase();

        const transactionType =
          String(
            item.type || ""
          ).toLowerCase();

        const note =
          String(
            item.note || ""
          ).toLowerCase();

        const amount =
          getAmount(item);

        const date =
          getDate(item);

        const transactionDate =
          date
            ? new Date(date)
            : null;

        const matchesSearch =
          !text ||
          fromName.includes(text) ||
          toName.includes(text) ||
          fromPhone.includes(text) ||
          toPhone.includes(text) ||
          fromEmail.includes(text) ||
          toEmail.includes(text) ||
          transactionId.includes(text) ||
          transactionId2.includes(text) ||
          orderId.includes(text) ||
          transactionType.includes(text) ||
          note.includes(text);

        const matchesType =
          type === "ALL" ||
          item.type === type;

        const matchesStatus =
          status === "ALL" ||
          item.status === status;

        const matchesFromRole =
          fromRole === "ALL" ||
          fromUser.role === fromRole;

        const matchesToRole =
          toRole === "ALL" ||
          toUser.role === toRole;

        const fromState = String(
          fromUser.state || ""
        ).toLowerCase();

        const toState = String(
          toUser.state || ""
        ).toLowerCase();

        const matchesState =
          !state ||
          fromState.includes(
            state.toLowerCase()
          ) ||
          toState.includes(
            state.toLowerCase()
          );

        const fromDistrict =
          String(
            fromUser.district || ""
          ).toLowerCase();

        const toDistrict =
          String(
            toUser.district || ""
          ).toLowerCase();

        const matchesDistrict =
          !district ||
          fromDistrict.includes(
            district.toLowerCase()
          ) ||
          toDistrict.includes(
            district.toLowerCase()
          );

        const fromCity =
          String(
            fromUser.city || ""
          ).toLowerCase();

        const toCity =
          String(
            toUser.city || ""
          ).toLowerCase();

        const matchesCity =
          !city ||
          fromCity.includes(
            city.toLowerCase()
          ) ||
          toCity.includes(
            city.toLowerCase()
          );

        const matchesMin =
          !minAmount ||
          amount >= Number(minAmount);

        const matchesMax =
          !maxAmount ||
          amount <= Number(maxAmount);

        const matchesFromDate =
          !fromDate ||
          (
            transactionDate &&
            !Number.isNaN(
              transactionDate.getTime()
            ) &&
            transactionDate >=
              new Date(
                `${fromDate}T00:00:00`
              )
          );

        const matchesToDate =
          !toDate ||
          (
            transactionDate &&
            !Number.isNaN(
              transactionDate.getTime()
            ) &&
            transactionDate <=
              new Date(
                `${toDate}T23:59:59.999`
              )
          );

        const matchesShortlist =
          shortlistOnly === "ALL" ||
          (
            shortlistOnly ===
              "SHORTLISTED" &&
            isShortlisted(item._id)
          ) ||
          (
            shortlistOnly ===
              "NOT_SHORTLISTED" &&
            !isShortlisted(item._id)
          );

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus &&
          matchesFromRole &&
          matchesToRole &&
          matchesState &&
          matchesDistrict &&
          matchesCity &&
          matchesMin &&
          matchesMax &&
          matchesFromDate &&
          matchesToDate &&
          matchesShortlist
        );
      });

    result.sort((a, b) => {
      const amountA =
        getAmount(a);

      const amountB =
        getAmount(b);

      const dateA =
        new Date(
          getDate(a) || 0
        ).getTime();

      const dateB =
        new Date(
          getDate(b) || 0
        ).getTime();

      if (
        sortBy ===
        "AMOUNT_HIGH"
      ) {
        return (
          amountB - amountA
        );
      }

      if (
        sortBy ===
        "AMOUNT_LOW"
      ) {
        return (
          amountA - amountB
        );
      }

      if (
        sortBy ===
        "OLDEST"
      ) {
        return (
          dateA - dateB
        );
      }

      return (
        dateB - dateA
      );
    });

    return result;
  }, [
    transactions,
    search,
    type,
    status,
    fromRole,
    toRole,
    state,
    district,
    city,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    sortBy,
    shortlistOnly,
    shortlisted,
  ]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const summary = useMemo(() => {
    let total = 0;
    let approved = 0;
    let submitted = 0;
    let rejected = 0;

    filtered.forEach((item) => {
      const amount =
        getAmount(item);

      total += amount;

      if (
        item.status ===
        "APPROVED"
      ) {
        approved += amount;
      }

      if (
        item.status ===
        "SUBMITTED"
      ) {
        submitted += amount;
      }

      if (
        item.status ===
        "REJECTED"
      ) {
        rejected += amount;
      }
    });

    return {
      count: filtered.length,
      total,
      approved,
      submitted,
      rejected,
    };
  }, [filtered]);

  // ======================================================
  // RESET FILTERS
  // ======================================================

  const resetFilters = () => {
    setSearch("");
    setType("ALL");
    setStatus("ALL");
    setFromRole("ALL");
    setToRole("ALL");
    setState("");
    setDistrict("");
    setCity("");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("NEWEST");
    setShortlistOnly("ALL");
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="cash-loading">
        Loading cash transactions...
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="cash-page">

      {/* HEADER */}

      <div className="cash-header">

        <div>
          <h1>
            Cash Transactions
          </h1>

          <p>
            Monitor, filter, sort and
            shortlist complete cash
            movement history.
          </p>
        </div>

        <button
          className="cash-btn secondary"
          onClick={
            loadTransactions
          }
        >
          ↻ Refresh
        </button>

      </div>

      {/* MESSAGE */}

      {message && (
        <div className="cash-message">
          {message}
        </div>
      )}

      {/* CASH WALLET INFORMATION */}

      <div className="cash-info-banner">
        <strong>
          Cash Handling Only
        </strong>

        <span>
          These transactions represent
          physical cash movement between
          Member, Team Leader, Cash Manager
          and Admin. Commission Wallet is
          separate from CashWallet.
        </span>
      </div>

      {/* SUMMARY */}

      <div className="cash-summary">

        <div className="cash-card">
          <span>
            Transactions
          </span>

          <strong>
            {summary.count}
          </strong>
        </div>

        <div className="cash-card">
          <span>
            Total Amount
          </span>

          <strong>
            {formatMoney(
              summary.total
            )}
          </strong>
        </div>

        <div className="cash-card">
          <span>
            Approved
          </span>

          <strong>
            {formatMoney(
              summary.approved
            )}
          </strong>
        </div>

        <div className="cash-card">
          <span>
            Submitted
          </span>

          <strong>
            {formatMoney(
              summary.submitted
            )}
          </strong>
        </div>

        <div className="cash-card">
          <span>
            Rejected
          </span>

          <strong>
            {formatMoney(
              summary.rejected
            )}
          </strong>
        </div>

      </div>

      {/* DATE RANGE */}

      <div className="cash-filter-section">

        <h3>
          Date Range
        </h3>

        <div className="cash-date-row">

          <div>
            <label>
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label>
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
            />
          </div>

        </div>

      </div>

      {/* FILTERS */}

      <div className="cash-filter-section">

        <h3>
          Filters
        </h3>

        <div className="cash-filters">

          <input
            placeholder="Search name, phone, email, ID, order..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <select
            value={type}
            onChange={(e) =>
              setType(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Types
            </option>

            {TRANSACTION_TYPES.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              )
            )}

          </select>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Status
            </option>

            <option value="SUBMITTED">
              Submitted
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>

          <select
            value={fromRole}
            onChange={(e) =>
              setFromRole(
                e.target.value
              )
            }
          >
            <option value="ALL">
              From: All Roles
            </option>

            {ROLES.map(
              (role) => (
                <option
                  key={role}
                  value={role}
                >
                  From: {role}
                </option>
              )
            )}
          </select>

          <select
            value={toRole}
            onChange={(e) =>
              setToRole(
                e.target.value
              )
            }
          >
            <option value="ALL">
              To: All Roles
            </option>

            {ROLES.map(
              (role) => (
                <option
                  key={role}
                  value={role}
                >
                  To: {role}
                </option>
              )
            )}
          </select>

          <input
            placeholder="State"
            value={state}
            onChange={(e) =>
              setState(
                e.target.value
              )
            }
          />

          <input
            placeholder="District"
            value={district}
            onChange={(e) =>
              setDistrict(
                e.target.value
              )
            }
          />

          <input
            placeholder="City"
            value={city}
            onChange={(e) =>
              setCity(
                e.target.value
              )
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Min Amount"
            value={minAmount}
            onChange={(e) =>
              setMinAmount(
                e.target.value
              )
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Max Amount"
            value={maxAmount}
            onChange={(e) =>
              setMaxAmount(
                e.target.value
              )
            }
          />

          <select
            value={shortlistOnly}
            onChange={(e) =>
              setShortlistOnly(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Transactions
            </option>

            <option value="SHORTLISTED">
              Shortlisted
            </option>

            <option value="NOT_SHORTLISTED">
              Not Shortlisted
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
          >
            <option value="NEWEST">
              Newest First
            </option>

            <option value="OLDEST">
              Oldest First
            </option>

            <option value="AMOUNT_HIGH">
              Amount High → Low
            </option>

            <option value="AMOUNT_LOW">
              Amount Low → High
            </option>
          </select>

          <button
            className="cash-btn secondary"
            onClick={
              resetFilters
            }
          >
            Clear Filters
          </button>

        </div>

      </div>

      {/* BULK ACTION */}

      <div className="cash-toolbar">

        <div>
          <strong>
            {filtered.length}
          </strong>{" "}
          transactions found
        </div>

        <div className="cash-toolbar-actions">

          <button
            className="cash-btn small"
            onClick={
              selectAll
            }
            disabled={
              filtered.length === 0
            }
          >
            Select All
          </button>

          <button
            className="cash-btn small secondary"
            onClick={
              clearSelection
            }
            disabled={
              selected.length === 0
            }
          >
            Clear Selection
          </button>

          {selected.length > 0 && (
            <>
              <button
                className="cash-btn small"
                onClick={() =>
                  bulkShortlist(true)
                }
              >
                ★ Shortlist Selected
              </button>

              <button
                className="cash-btn small danger"
                onClick={() =>
                  bulkShortlist(false)
                }
              >
                Remove Shortlist
              </button>
            </>
          )}

        </div>

      </div>

      {/* TABLE */}

      <div className="cash-table-wrapper">

        <table className="cash-table">

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

              <th>
                ★
              </th>

              <th>
                From
              </th>

              <th>
                From Role
              </th>

              <th>
                To
              </th>

              <th>
                To Role
              </th>

              <th>
                Type
              </th>

              <th>
                Amount
              </th>

              <th>
                Status
              </th>

              <th>
                Date
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.length === 0 ? (

              <tr>

                <td
                  colSpan="11"
                  className="cash-no-data"
                >
                  No transactions
                  found.
                </td>

              </tr>

            ) : (

              filtered.map(
                (item) => {

                  const fromUser =
                    getUser(
                      item,
                      "from"
                    );

                  const toUser =
                    getUser(
                      item,
                      "to"
                    );

                  const amount =
                    getAmount(
                      item
                    );

                  return (
                    <tr
                      key={
                        item._id
                      }
                    >

                      <td>

                        <input
                          type="checkbox"
                          checked={selected.includes(
                            item._id
                          )}
                          onChange={() =>
                            toggleSelect(
                              item._id
                            )
                          }
                        />

                      </td>

                      <td>

                        <button
                          className={`cash-star ${
                            isShortlisted(
                              item._id
                            )
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleShortlist(
                              item._id
                            )
                          }
                          title={
                            isShortlisted(
                              item._id
                            )
                              ? "Remove shortlist"
                              : "Shortlist"
                          }
                        >
                          ★
                        </button>

                      </td>

                      <td>

                        <strong>
                          {fromUser.name ||
                            "-"}
                        </strong>

                        <small>
                          {fromUser.phone ||
                            ""}
                        </small>

                      </td>

                      <td>
                        {fromUser.role ||
                          "-"}
                      </td>

                      <td>

                        <strong>
                          {toUser.name ||
                            "-"}
                        </strong>

                        <small>
                          {toUser.phone ||
                            ""}
                        </small>

                      </td>

                      <td>
                        {toUser.role ||
                          "-"}
                      </td>

                      <td>

                        <span className="cash-type">
                          {formatType(
                            item.type
                          )}
                        </span>

                      </td>

                      <td className="cash-amount">

                        {formatMoney(
                          amount
                        )}

                      </td>

                      <td>

                        <span
                          className={`cash-status ${String(
                            item.status ||
                              ""
                          ).toLowerCase()}`}
                        >
                          {item.status ||
                            "-"}
                        </span>

                      </td>

                      <td>
                        {formatDate(
                          getDate(
                            item
                          )
                        )}
                      </td>

                      <td>

                        <button
                          className="cash-btn small"
                          onClick={() =>
                            setSelectedTransaction(
                              item
                            )
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>
                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>

      {/* DETAILS MODAL */}

      {selectedTransaction && (

        <div
          className="cash-modal-overlay"
          onClick={() =>
            setSelectedTransaction(
              null
            )
          }
        >

          <div
            className="cash-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="cash-modal-header">

              <div>

                <h2>
                  Transaction Details
                </h2>

                <p>
                  ID:{" "}
                  {selectedTransaction._id ||
                    "-"}
                </p>

              </div>

              <button
                className="cash-close"
                onClick={() =>
                  setSelectedTransaction(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="cash-details">

              <div>
                <span>
                  From
                </span>

                <strong>
                  {
                    getUser(
                      selectedTransaction,
                      "from"
                    ).name ||
                      "-"
                  }
                </strong>
              </div>

              <div>
                <span>
                  From Role
                </span>

                <strong>
                  {
                    getUser(
                      selectedTransaction,
                      "from"
                    ).role ||
                      "-"
                  }
                </strong>
              </div>

              <div>
                <span>
                  From Phone
                </span>

                <strong>
                  {
                    getUser(
                      selectedTransaction,
                      "from"
                    ).phone ||
                      "-"
                  }
                </strong>
              </div>

              <div>
                <span>
                  To
                </span>

                <strong>
                  {
                    getUser(
                      selectedTransaction,
                      "to"
                    ).name ||
                      "-"
                  }
                </strong>
              </div>

              <div>
                <span>
                  To Role
                </span>

                <strong>
                  {
                    getUser(
                      selectedTransaction,
                      "to"
                    ).role ||
                      "-"
                  }
                </strong>
              </div>

              <div>
                <span>
                  To Phone
                </span>

                <strong>
                  {
                    getUser(
                      selectedTransaction,
                      "to"
                    ).phone ||
                      "-"
                  }
                </strong>
              </div>

              <div>
                <span>
                  Amount
                </span>

                <strong>
                  {formatMoney(
                    getAmount(
                      selectedTransaction
                    )
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Type
                </span>

                <strong>
                  {formatType(
                    selectedTransaction.type
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong>
                  {selectedTransaction.status ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Transaction ID
                </span>

                <strong>
                  {selectedTransaction.transactionId ||
                    selectedTransaction._id ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Order ID
                </span>

                <strong>
                  {getOrderId(
                    selectedTransaction
                  ) || "-"}
                </strong>
              </div>

              <div>
                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    getDate(
                      selectedTransaction
                    )
                  )}
                </strong>
              </div>

              <div className="cash-detail-full">

                <span>
                  Note
                </span>

                <strong>
                  {selectedTransaction.note ||
                    "-"}
                </strong>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default CashTransactions;
