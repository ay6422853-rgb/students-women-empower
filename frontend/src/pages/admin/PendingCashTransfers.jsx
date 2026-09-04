import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./PendingCashTransfers.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

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

function PendingCashTransfers() {
  const [transfers, setTransfers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [search, setSearch] = useState("");

  const [fromRole, setFromRole] = useState("ALL");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [minAmount, setMinAmount] = useState("");

  const [maxAmount, setMaxAmount] = useState("");

  const [sortBy, setSortBy] = useState("NEWEST");

  const [selected, setSelected] = useState([]);

  const [details, setDetails] = useState(null);

  const [processing, setProcessing] = useState(false);

  // ======================================================
  // CASH MANAGER BALANCE
  // ======================================================

  const [showManagerBalances, setShowManagerBalances] =
    useState(false);

  const [cashManagers, setCashManagers] =
    useState([]);

  const [managerLoading, setManagerLoading] =
    useState(false);

  const token = localStorage.getItem("token");

  // ======================================================
  // API REQUEST
  // ======================================================

  const request = async (
    url,
    options = {}
  ) => {
    const response = await fetch(`${API}${url}`, {
      ...options,

      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",

        ...(options.headers || {}),
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Request failed"
      );
    }

    return data;
  };

  // ======================================================
  // LOAD PENDING ADMIN TRANSFERS
  // ======================================================

  const loadTransfers = async () => {
    try {
      setLoading(true);

      setMessage("");

      setMessageType("");

      const data = await request(
        "/cash/admin/pending"
      );

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.transactions)
        ? data.transactions
        : Array.isArray(data.transfers)
        ? data.transfers
        : Array.isArray(data.data)
        ? data.data
        : [];

      setTransfers(list);

      setSelected((previous) =>
        previous.filter((id) =>
          list.some(
            (item) => item._id === id
          )
        )
      );
    } catch (error) {
      console.error(
        "Load pending admin transfers error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load pending transfers"
      );

      setMessageType("error");

      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD CASH MANAGER BALANCES
  // ======================================================

  const loadCashManagerBalances = async () => {
    try {
      setManagerLoading(true);

      const data = await request(
        "/cash/admin/cash-managers"
      );

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.cashManagers)
        ? data.cashManagers
        : Array.isArray(data.managers)
        ? data.managers
        : Array.isArray(data.data)
        ? data.data
        : [];

      setCashManagers(list);
    } catch (error) {
      console.error(
        "Load cash manager balances error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load Cash Manager balances"
      );

      setMessageType("error");

      setCashManagers([]);
    } finally {
      setManagerLoading(false);
    }
  };

  const openCashManagerBalances = async () => {
    setShowManagerBalances(true);

    await loadCashManagerBalances();
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadTransfers();
  }, []);

  // ======================================================
  // DATA HELPERS
  // ======================================================

  const getUser = (item) =>
    item?.from ||
    item?.sender ||
    item?.sourceUser ||
    item?.cashManager ||
    {};

  const getAmount = (item) =>
    Number(
      item?.amount ||
        item?.totalAmount ||
        item?.value ||
        0
    );

  const getDate = (item) =>
    item?.createdAt ||
    item?.date ||
    item?.transactionDate ||
    null;

  // ======================================================
  // FILTER + SORT
  // ======================================================

  const filtered = useMemo(() => {
    const text = search
      .trim()
      .toLowerCase();

    const result = transfers.filter(
      (item) => {
        const user = getUser(item);

        const name = String(
          user.name || ""
        ).toLowerCase();

        const phone = String(
          user.phone || ""
        ).toLowerCase();

        const email = String(
          user.email || ""
        ).toLowerCase();

        const id = String(
          item._id || ""
        ).toLowerCase();

        const transactionId = String(
          item.transactionId || ""
        ).toLowerCase();

        const note = String(
          item.note || ""
        ).toLowerCase();

        const amount = getAmount(item);

        const date = getDate(item);

        const transactionDate = date
          ? new Date(date)
          : null;

        const matchesSearch =
          !text ||
          name.includes(text) ||
          phone.includes(text) ||
          email.includes(text) ||
          id.includes(text) ||
          transactionId.includes(text) ||
          note.includes(text);

        const matchesRole =
          fromRole === "ALL" ||
          user.role === fromRole;

        const matchesMin =
          !minAmount ||
          amount >= Number(minAmount);

        const matchesMax =
          !maxAmount ||
          amount <= Number(maxAmount);

        const matchesFromDate =
          !fromDate ||
          (transactionDate &&
            !Number.isNaN(
              transactionDate.getTime()
            ) &&
            transactionDate >=
              new Date(
                `${fromDate}T00:00:00`
              ));

        const matchesToDate =
          !toDate ||
          (transactionDate &&
            !Number.isNaN(
              transactionDate.getTime()
            ) &&
            transactionDate <=
              new Date(
                `${toDate}T23:59:59.999`
              ));

        return (
          matchesSearch &&
          matchesRole &&
          matchesMin &&
          matchesMax &&
          matchesFromDate &&
          matchesToDate
        );
      }
    );

    result.sort((a, b) => {
      const amountA = getAmount(a);

      const amountB = getAmount(b);

      const dateA = new Date(
        getDate(a) || 0
      ).getTime();

      const dateB = new Date(
        getDate(b) || 0
      ).getTime();

      if (sortBy === "AMOUNT_HIGH") {
        return amountB - amountA;
      }

      if (sortBy === "AMOUNT_LOW") {
        return amountA - amountB;
      }

      if (sortBy === "OLDEST") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });

    return result;
  }, [
    transfers,
    search,
    fromRole,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    sortBy,
  ]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const totalAmount = useMemo(
    () =>
      filtered.reduce(
        (sum, item) =>
          sum + getAmount(item),
        0
      ),
    [filtered]
  );

  const highestAmount = useMemo(() => {
    if (!filtered.length) {
      return 0;
    }

    return Math.max(
      ...filtered.map((item) =>
        getAmount(item)
      )
    );
  }, [filtered]);

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  // ======================================================
  // CASH MANAGER BALANCE HELPERS
  // ======================================================

  const getManagerWallet = (manager) =>
    manager?.cashWallet ||
    manager?.wallet ||
    {};

  const getManagerUser = (manager) =>
    manager?.user ||
    manager?.manager ||
    manager ||
    {};

  const getManagerAvailableBalance = (
    manager
  ) => {
    const wallet =
      getManagerWallet(manager);

    return Number(
      wallet.availableBalance ??
        manager.availableBalance ??
        0
    );
  };

  const getManagerPendingBalance = (
    manager
  ) => {
    const wallet =
      getManagerWallet(manager);

    return Number(
      wallet.pendingBalance ??
        manager.pendingBalance ??
        0
    );
  };

  const getManagerTotalReceived = (
    manager
  ) => {
    const wallet =
      getManagerWallet(manager);

    return Number(
      wallet.totalReceived ??
        manager.totalReceived ??
        0
    );
  };

  const getManagerTotalTransferred = (
    manager
  ) => {
    const wallet =
      getManagerWallet(manager);

    return Number(
      wallet.totalTransferred ??
        manager.totalTransferred ??
        0
    );
  };

  const totalManagerAvailable = useMemo(
    () =>
      cashManagers.reduce(
        (sum, manager) =>
          sum +
          getManagerAvailableBalance(
            manager
          ),
        0
      ),
    [cashManagers]
  );

  const totalManagerPending = useMemo(
    () =>
      cashManagers.reduce(
        (sum, manager) =>
          sum +
          getManagerPendingBalance(
            manager
          ),
        0
      ),
    [cashManagers]
  );

  // ======================================================
  // SELECTION
  // ======================================================

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

  const toggleSelect = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter(
            (itemId) =>
              itemId !== id
          )
        : [
            ...previous,
            id,
          ]
    );
  };

  // ======================================================
  // SINGLE APPROVE / REJECT
  // ======================================================

  const action = async (
    id,
    type
  ) => {
    if (!id) {
      return;
    }

    const isApprove =
      type === "approve";

    const confirmed =
      window.confirm(
        isApprove
          ? "Are you sure you want to APPROVE this Cash Manager → Admin transfer?"
          : "Are you sure you want to REJECT this Cash Manager → Admin transfer?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      setMessage("");

      setMessageType("");

      await request(
        `/cash/admin/${id}/${type}`,
        {
          method: "PATCH",
        }
      );

      setMessage(
        isApprove
          ? "Cash transfer approved successfully."
          : "Cash transfer rejected successfully."
      );

      setMessageType("success");

      setDetails(null);

      setSelected((previous) =>
        previous.filter(
          (itemId) =>
            itemId !== id
        )
      );

      await loadTransfers();

      if (showManagerBalances) {
        await loadCashManagerBalances();
      }
    } catch (error) {
      console.error(
        "Cash transfer action error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to process transfer"
      );

      setMessageType("error");
    } finally {
      setProcessing(false);
    }
  };

  // ======================================================
  // BULK ACTION
  // ======================================================

  const bulkAction = async (
    type
  ) => {
    if (!selected.length) {
      return;
    }

    const isApprove =
      type === "approve";

    const confirmed =
      window.confirm(
        isApprove
          ? `Approve ${selected.length} selected Cash Manager → Admin transfers?`
          : `Reject ${selected.length} selected Cash Manager → Admin transfers?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      setMessage("");

      setMessageType("");

      let successCount = 0;

      let failedCount = 0;

      for (
        const id of selected
      ) {
        try {
          await request(
            `/cash/admin/${id}/${type}`,
            {
              method: "PATCH",
            }
          );

          successCount++;
        } catch (error) {
          console.error(
            `Failed to ${type} transfer ${id}:`,
            error
          );

          failedCount++;
        }
      }

      setSelected([]);

      if (failedCount === 0) {
        setMessage(
          isApprove
            ? `${successCount} cash transfer(s) approved successfully.`
            : `${successCount} cash transfer(s) rejected successfully.`
        );

        setMessageType(
          "success"
        );
      } else {
        setMessage(
          `${successCount} processed successfully, ${failedCount} failed.`
        );

        setMessageType(
          "error"
        );
      }

      await loadTransfers();

      if (showManagerBalances) {
        await loadCashManagerBalances();
      }
    } catch (error) {
      console.error(
        "Bulk action error:",
        error
      );

      setMessage(
        error.message ||
          "Bulk operation failed"
      );

      setMessageType("error");
    } finally {
      setProcessing(false);
    }
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {
    setSearch("");

    setFromRole("ALL");

    setFromDate("");

    setToDate("");

    setMinAmount("");

    setMaxAmount("");

    setSortBy("NEWEST");
  };

  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="pending-cash-loading">
        <div className="pending-loading-spinner"></div>

        <p>
          Loading pending
          transfers...
        </p>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="pending-cash-page">

      {/* HEADER */}

      <div className="pending-cash-header">
        <div>
          <div className="pending-title-row">
            <span className="pending-title-icon">
              ₹
            </span>

            <h1>
              Pending Cash Transfers
            </h1>
          </div>

          <p>
            Review and approve
            Cash Manager → Admin
            transfer requests.
          </p>
        </div>

        <div className="pending-header-actions">

          <button
            type="button"
            className="pending-btn manager-balance-btn"
            onClick={
              openCashManagerBalances
            }
            disabled={processing}
          >
            <span>◉</span>
            Cash Manager Balance
          </button>

          <button
            type="button"
            className="pending-btn secondary"
            onClick={
              loadTransfers
            }
            disabled={processing}
          >
            ↻ Refresh
          </button>

        </div>
      </div>

      {/* MESSAGE */}

      {message && (
        <div
          className={`pending-message ${messageType}`}
        >
          <span>
            {messageType ===
            "success"
              ? "✓"
              : "⚠"}
          </span>

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setMessageType("");
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="pending-summary">

        <div className="pending-card">
          <div className="pending-card-icon">
            ⇄
          </div>

          <div>
            <span>
              Pending Transfers
            </span>

            <strong>
              {filtered.length}
            </strong>
          </div>
        </div>

        <div className="pending-card">
          <div className="pending-card-icon">
            ₹
          </div>

          <div>
            <span>
              Total Pending Amount
            </span>

            <strong>
              {formatMoney(
                totalAmount
              )}
            </strong>
          </div>
        </div>

        <div className="pending-card">
          <div className="pending-card-icon">
            ↑
          </div>

          <div>
            <span>
              Highest Transfer
            </span>

            <strong>
              {formatMoney(
                highestAmount
              )}
            </strong>
          </div>
        </div>

        <div className="pending-card">
          <div className="pending-card-icon">
            ✓
          </div>

          <div>
            <span>
              Selected
            </span>

            <strong>
              {selected.length}
            </strong>
          </div>
        </div>

      </div>

      {/* DATE FILTER */}

      <div className="pending-filter-section">

        <div className="section-heading">
          <div>
            <h3>
              Date Range
            </h3>

            <p>
              Filter transfers by
              transaction date.
            </p>
          </div>
        </div>

        <div className="pending-date-row">

          <div className="filter-field">
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

          <div className="filter-field">
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

      <div className="pending-filter-section">

        <div className="section-heading">
          <div>
            <h3>
              Filters & Sorting
            </h3>

            <p>
              Search and filter
              pending transfers.
            </p>
          </div>

          <button
            type="button"
            className="pending-btn secondary"
            onClick={
              clearFilters
            }
          >
            Clear Filters
          </button>
        </div>

        <div className="pending-filters">

          <div className="filter-field search-field">
            <label>
              Search
            </label>

            <input
              placeholder="Name, phone, email, ID, note..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <div className="filter-field">
            <label>
              Sender Role
            </label>

            <select
              value={fromRole}
              onChange={(e) =>
                setFromRole(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Sender Roles
              </option>

              {ROLES.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filter-field">
            <label>
              Minimum Amount
            </label>

            <input
              type="number"
              min="0"
              placeholder="₹ Min"
              value={minAmount}
              onChange={(e) =>
                setMinAmount(
                  e.target.value
                )
              }
            />
          </div>

          <div className="filter-field">
            <label>
              Maximum Amount
            </label>

            <input
              type="number"
              min="0"
              placeholder="₹ Max"
              value={maxAmount}
              onChange={(e) =>
                setMaxAmount(
                  e.target.value
                )
              }
            />
          </div>

          <div className="filter-field">
            <label>
              Sort By
            </label>

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
          </div>

        </div>

      </div>

      {/* ACTION BAR */}

      <div className="pending-toolbar">

        <div className="toolbar-info">
          <strong>
            {filtered.length}
          </strong>

          <span>
            pending requests
          </span>
        </div>

        <div className="pending-toolbar-actions">

          <button
            type="button"
            className="pending-btn small"
            onClick={
              selectAll
            }
            disabled={
              processing ||
              filtered.length === 0
            }
          >
            Select All
          </button>

          <button
            type="button"
            className="pending-btn small secondary"
            onClick={
              clearSelection
            }
            disabled={
              processing ||
              selected.length === 0
            }
          >
            Clear
          </button>

          {selected.length > 0 && (
            <>
              <button
                type="button"
                className="pending-btn approve"
                onClick={() =>
                  bulkAction(
                    "approve"
                  )
                }
                disabled={
                  processing
                }
              >
                ✓ Approve Selected
              </button>

              <button
                type="button"
                className="pending-btn reject"
                onClick={() =>
                  bulkAction(
                    "reject"
                  )
                }
                disabled={
                  processing
                }
              >
                ✕ Reject Selected
              </button>
            </>
          )}

        </div>

      </div>

      {/* TABLE */}

      <div className="pending-table-wrapper">

        <table className="pending-table">

          <thead>
            <tr>

              <th className="checkbox-column">
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
                  disabled={
                    processing
                  }
                />
              </th>

              <th>
                Cash Manager
              </th>

              <th>
                Role
              </th>

              <th>
                Amount
              </th>

              <th>
                Status
              </th>

              <th>
                Note
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
                  colSpan="8"
                  className="pending-no-data"
                >
                  <div className="no-data-icon">
                    ✓
                  </div>

                  <strong>
                    No pending transfers
                  </strong>

                  <span>
                    No Cash Manager →
                    Admin transfers
                    match your current
                    filters.
                  </span>
                </td>
              </tr>
            ) : (
              filtered.map(
                (item) => {
                  const user =
                    getUser(item);

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
                          disabled={
                            processing
                          }
                        />
                      </td>

                      <td>
                        <div className="manager-cell">

                          <div className="manager-avatar">
                            {String(
                              user.name ||
                                "C"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.name ||
                                "Cash Manager"}
                            </strong>

                            <small>
                              {user.phone ||
                                user.email ||
                                "-"}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="role-badge">
                          {user.role ||
                            "CASH_MANAGER"}
                        </span>
                      </td>

                      <td className="pending-amount">
                        {formatMoney(
                          getAmount(
                            item
                          )
                        )}
                      </td>

                      <td>
                        <span className="pending-status">
                          {item.status ===
                          "SUBMITTED"
                            ? "PENDING"
                            : item.status ||
                              "PENDING"}
                        </span>
                      </td>

                      <td className="pending-note">
                        {item.note ||
                          "-"}
                      </td>

                      <td className="date-cell">
                        {formatDate(
                          getDate(
                            item
                          )
                        )}
                      </td>

                      <td>
                        <div className="pending-actions">

                          <button
                            type="button"
                            className="pending-btn small"
                            onClick={() =>
                              setDetails(
                                item
                              )
                            }
                            disabled={
                              processing
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="pending-btn approve small"
                            onClick={() =>
                              action(
                                item._id,
                                "approve"
                              )
                            }
                            disabled={
                              processing
                            }
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            className="pending-btn reject small"
                            onClick={() =>
                              action(
                                item._id,
                                "reject"
                              )
                            }
                            disabled={
                              processing
                            }
                          >
                            Reject
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                }
              )
            )}

          </tbody>

        </table>

      </div>

      {/* ======================================================
          CASH MANAGER BALANCE MODAL
          ====================================================== */}

      {showManagerBalances && (
        <div
          className="manager-balance-overlay"
          onClick={() =>
            setShowManagerBalances(false)
          }
        >

          <div
            className="manager-balance-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="manager-balance-header">

              <div>
                <span>
                  CASH MANAGEMENT
                </span>

                <h2>
                  Cash Manager Balances
                </h2>

                <p>
                  Current cash position of
                  every Cash Manager.
                </p>
              </div>

              <div className="manager-balance-header-actions">

                <button
                  type="button"
                  className="pending-btn secondary small"
                  onClick={
                    loadCashManagerBalances
                  }
                  disabled={
                    managerLoading
                  }
                >
                  ↻ Refresh
                </button>

                <button
                  type="button"
                  className="manager-modal-close"
                  onClick={() =>
                    setShowManagerBalances(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

            </div>

            {managerLoading ? (
              <div className="manager-balance-loading">
                <div className="pending-loading-spinner"></div>

                <p>
                  Loading Cash Manager
                  balances...
                </p>
              </div>
            ) : (
              <>
                {/* BALANCE SUMMARY */}

                <div className="manager-balance-summary">

                  <div className="manager-summary-card">
                    <span>
                      Cash Managers
                    </span>

                    <strong>
                      {cashManagers.length}
                    </strong>
                  </div>

                  <div className="manager-summary-card available">
                    <span>
                      Total Available
                    </span>

                    <strong>
                      {formatMoney(
                        totalManagerAvailable
                      )}
                    </strong>
                  </div>

                  <div className="manager-summary-card pending">
                    <span>
                      Total Pending
                    </span>

                    <strong>
                      {formatMoney(
                        totalManagerPending
                      )}
                    </strong>
                  </div>

                </div>

                {/* MANAGER LIST */}

                {cashManagers.length === 0 ? (
                  <div className="manager-empty">
                    <div>
                      ✓
                    </div>

                    <strong>
                      No Cash Managers Found
                    </strong>

                    <span>
                      There are currently no
                      Cash Managers in the
                      system.
                    </span>
                  </div>
                ) : (
                  <div className="manager-balance-table-wrapper">

                    <table className="manager-balance-table">

                      <thead>
                        <tr>
                          <th>
                            CASH MANAGER
                          </th>

                          <th>
                            CONTACT
                          </th>

                          <th>
                            AVAILABLE
                          </th>

                          <th>
                            PENDING
                          </th>

                          <th>
                            TOTAL RECEIVED
                          </th>

                          <th>
                            TOTAL TRANSFERRED
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {cashManagers.map(
                          (manager) => {
                            const user =
                              getManagerUser(
                                manager
                              );

                            return (
                              <tr
                                key={
                                  user._id ||
                                  manager._id
                                }
                              >

                                <td>
                                  <div className="balance-manager-cell">

                                    <div className="balance-manager-avatar">
                                      {String(
                                        user.name ||
                                          "C"
                                      )
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()}
                                    </div>

                                    <div>
                                      <strong>
                                        {user.name ||
                                          "Cash Manager"}
                                      </strong>

                                      <small>
                                        ID:{" "}
                                        {user._id ||
                                          manager._id ||
                                          "-"}
                                      </small>
                                    </div>

                                  </div>
                                </td>

                                <td>
                                  <div className="manager-contact-info">

                                    <span>
                                      ☎{" "}
                                      {user.phone ||
                                        "-"}
                                    </span>

                                    <span>
                                      ✉{" "}
                                      {user.email ||
                                        "-"}
                                    </span>

                                  </div>
                                </td>

                                <td>
                                  <div className="available-money">
                                    {formatMoney(
                                      getManagerAvailableBalance(
                                        manager
                                      )
                                    )}
                                  </div>

                                  <small className="balance-hint">
                                    Available now
                                  </small>
                                </td>

                                <td>
                                  <div className="pending-money">
                                    {formatMoney(
                                      getManagerPendingBalance(
                                        manager
                                      )
                                    )}
                                  </div>

                                  <small className="balance-hint">
                                    Admin transfer
                                  </small>
                                </td>

                                <td>
                                  <strong>
                                    {formatMoney(
                                      getManagerTotalReceived(
                                        manager
                                      )
                                    )}
                                  </strong>
                                </td>

                                <td>
                                  <strong>
                                    {formatMoney(
                                      getManagerTotalTransferred(
                                        manager
                                      )
                                    )}
                                  </strong>
                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </>
            )}

          </div>

        </div>
      )}

      {/* DETAILS MODAL */}

      {details && (
        <div
          className="pending-modal-overlay"
          onClick={() =>
            setDetails(null)
          }
        >

          <div
            className="pending-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="pending-modal-header">

              <div>
                <span className="modal-label">
                  CASH TRANSFER
                </span>

                <h2>
                  Transfer Details
                </h2>

                <p>
                  ID:{" "}
                  {details._id ||
                    "-"}
                </p>
              </div>

              <button
                type="button"
                className="pending-close"
                onClick={() =>
                  setDetails(null)
                }
              >
                ×
              </button>

            </div>

            <div className="pending-details">

              <div>
                <span>
                  Cash Manager
                </span>

                <strong>
                  {getUser(
                    details
                  ).name || "-"}
                </strong>
              </div>

              <div>
                <span>
                  Phone
                </span>

                <strong>
                  {getUser(
                    details
                  ).phone || "-"}
                </strong>
              </div>

              <div>
                <span>
                  Email
                </span>

                <strong>
                  {getUser(
                    details
                  ).email || "-"}
                </strong>
              </div>

              <div>
                <span>
                  Role
                </span>

                <strong>
                  {getUser(
                    details
                  ).role ||
                    "CASH_MANAGER"}
                </strong>
              </div>

              <div>
                <span>
                  Amount
                </span>

                <strong className="modal-amount">
                  {formatMoney(
                    getAmount(
                      details
                    )
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Type
                </span>

                <strong>
                  {details.type ||
                    "CASH_MANAGER_TO_ADMIN"}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong>
                  {details.status ===
                  "SUBMITTED"
                    ? "PENDING"
                    : details.status ||
                      "PENDING"}
                </strong>
              </div>

              <div>
                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    getDate(
                      details
                    )
                  )}
                </strong>
              </div>

              <div className="pending-detail-full">
                <span>
                  Transaction ID
                </span>

                <strong>
                  {details.transactionId ||
                    "-"}
                </strong>
              </div>

              <div className="pending-detail-full">
                <span>
                  Note
                </span>

                <strong>
                  {details.note ||
                    "-"}
                </strong>
              </div>

            </div>

            <div className="pending-modal-actions">

              <button
                type="button"
                className="pending-btn approve"
                onClick={() =>
                  action(
                    details._id,
                    "approve"
                  )
                }
                disabled={
                  processing
                }
              >
                ✓ Approve Transfer
              </button>

              <button
                type="button"
                className="pending-btn reject"
                onClick={() =>
                  action(
                    details._id,
                    "reject"
                  )
                }
                disabled={
                  processing
                }
              >
                ✕ Reject Transfer
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default PendingCashTransfers;