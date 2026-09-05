import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./CashTransfer.css";

const API =
  import.meta.env.VITE_API_URL ||
  "https://students-and-women-empower.onrender.com/api";

function CashTransfer() {
  const [managers, setManagers] =
    useState([]);

  const [transfers, setTransfers] =
    useState([]);

  const [collections, setCollections] =
    useState([]);

  const [wallet, setWallet] =
    useState(null);

  const [cashManagerId, setCashManagerId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const token =
    localStorage.getItem("token");

  const headers = useMemo(
    () => ({
      "Content-Type":
        "application/json",

      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error(
          "Login session not found."
        );
      }

      const [
        managerResponse,
        transferResponse,
        collectionResponse,
        walletResponse,
      ] = await Promise.all([
        fetch(
          `${API}/cash/cash-managers`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API}/cash/my-transfers`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API}/cash/my-collections`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API}/cash/my-wallet`,
          {
            method: "GET",
            headers,
          }
        ),
      ]);

      // ==================================================
      // MANAGERS
      // ==================================================

      const managerData =
        await managerResponse.json();

      if (!managerResponse.ok) {
        throw new Error(
          managerData.message ||
            "Unable to load Cash Managers."
        );
      }

      const managerList =
        Array.isArray(
          managerData.cashManagers
        )
          ? managerData.cashManagers
          : Array.isArray(
              managerData.users
            )
          ? managerData.users
          : [];

      setManagers(managerList);

      // ==================================================
      // TRANSFERS
      // ==================================================

      const transferData =
        await transferResponse.json();

      if (!transferResponse.ok) {
        throw new Error(
          transferData.message ||
            "Unable to load cash transfers."
        );
      }

      setTransfers(
        Array.isArray(
          transferData.transactions
        )
          ? transferData.transactions
          : []
      );

      // ==================================================
      // COLLECTIONS
      // ==================================================

      const collectionData =
        await collectionResponse.json();

      if (!collectionResponse.ok) {
        throw new Error(
          collectionData.message ||
            "Unable to load cash collections."
        );
      }

      setCollections(
        Array.isArray(
          collectionData.transactions
        )
          ? collectionData.transactions
          : []
      );

      // ==================================================
      // WALLET
      // ==================================================

      const walletData =
        await walletResponse.json();

      if (!walletResponse.ok) {
        throw new Error(
          walletData.message ||
            "Unable to load cash wallet."
        );
      }

      if (walletData.wallet) {
        setWallet(
          walletData.wallet
        );
      } else {
        setWallet({
          availableBalance: 0,
          pendingBalance: 0,
          totalCollected: 0,
          totalReceived: 0,
          totalTransferred: 0,
        });
      }
    } catch (err) {
      console.error(
        "Cash Transfer load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load cash transfer data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadData();
  }, []);

  // ======================================================
  // WALLET VALUES
  // ======================================================

  const walletAvailable =
    Number(
      wallet?.availableBalance || 0
    );

  const walletPending =
    Number(
      wallet?.pendingBalance || 0
    );

  const walletTotalCollected =
    Number(
      wallet?.totalCollected || 0
    );

  const walletTotalTransferred =
    Number(
      wallet?.totalTransferred || 0
    );

  // ======================================================
  // HISTORY CALCULATIONS
  // ======================================================

  const historyCollected =
    collections.reduce(
      (sum, item) => {
        const status =
          String(
            item.status || ""
          ).toUpperCase();

        if (
          status !== "APPROVED"
        ) {
          return sum;
        }

        return (
          sum +
          Number(
            item.amount || 0
          )
        );
      },
      0
    );

  const historyApprovedTransferred =
    transfers.reduce(
      (sum, item) => {
        const status =
          String(
            item.status || ""
          ).toUpperCase();

        if (
          status !== "APPROVED"
        ) {
          return sum;
        }

        return (
          sum +
          Number(
            item.amount || 0
          )
        );
      },
      0
    );

  const historyPendingTransfer =
    transfers.reduce(
      (sum, item) => {
        const status =
          String(
            item.status || ""
          ).toUpperCase();

        if (
          status !== "SUBMITTED" &&
          status !== "PENDING"
        ) {
          return sum;
        }

        return (
          sum +
          Number(
            item.amount || 0
          )
        );
      },
      0
    );

  // ======================================================
  // DISPLAY VALUES
  //
  // Backend wallet is the source of truth.
  // History is only used as fallback.
  // ======================================================

  const totalCollected =
    wallet
      ? walletTotalCollected
      : historyCollected;

  const availableBalance =
    wallet
      ? walletAvailable
      : Math.max(
          0,
          historyCollected -
            historyApprovedTransferred -
            historyPendingTransfer
        );

  const pendingBalance =
    wallet
      ? walletPending
      : historyPendingTransfer;

  const approvedTransferred =
    wallet
      ? walletTotalTransferred
      : historyApprovedTransferred;

  // ======================================================
  // FORMATTING
  // ======================================================

  const formatCurrency = (
    value
  ) => {
    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

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
  // TRANSFER CASH
  // ======================================================

  const handleTransfer = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!cashManagerId) {
      setError(
        "Please select a Cash Manager."
      );
      return;
    }

    const transferAmount =
      Number(amount);

    if (
      !Number.isFinite(
        transferAmount
      ) ||
      transferAmount <= 0
    ) {
      setError(
        "Please enter a valid transfer amount."
      );
      return;
    }

    if (
      transferAmount >
      availableBalance
    ) {
      setError(
        `Transfer amount cannot be greater than available balance of ${formatCurrency(
          availableBalance
        )}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await fetch(
          `${API}/cash/transfer`,
          {
            method: "POST",
            headers,

            body: JSON.stringify({
              cashManagerId,
              amount:
                transferAmount,
              note:
                note.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Cash transfer failed."
        );
      }

      setAmount("");
      setNote("");
      setCashManagerId("");

      setSuccess(
        "Cash transfer submitted successfully. The amount is now pending until the Cash Manager approves it."
      );

      // Immediately refresh wallet,
      // transfer history and collections.
      await loadData();
    } catch (err) {
      console.error(
        "Cash transfer error:",
        err
      );

      setError(
        err.message ||
          "Unable to transfer cash."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // STATUS
  // ======================================================

  const getStatusClass = (
    status
  ) => {
    switch (
      String(
        status || ""
      ).toUpperCase()
    ) {
      case "APPROVED":
        return "status-approved";

      case "REJECTED":
        return "status-rejected";

      case "SUBMITTED":
      case "PENDING":
        return "status-pending";

      default:
        return "";
    }
  };

  const getDisplayStatus = (
    status
  ) => {
    const normalized =
      String(
        status || ""
      ).toUpperCase();

    if (
      normalized ===
      "SUBMITTED"
    ) {
      return "PENDING";
    }

    return normalized || "UNKNOWN";
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="cash-transfer-page">
        <div className="cash-loading">
          <div className="cash-spinner"></div>

          <p>
            Loading cash transfer
            data...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="cash-transfer-page">

      <div className="cash-transfer-container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="cash-page-header">

          <div>
            <span className="cash-page-kicker">
              TEAM LEADER
            </span>

            <h1>
              Cash Transfer
            </h1>

            <p>
              Manage collected member
              cash and transfer it to
              an approved Cash Manager.
            </p>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={
              loadData
            }
            disabled={
              loading ||
              submitting
            }
          >
            ↻ Refresh
          </button>

        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="cash-alert error">

            <span className="alert-icon">
              ⚠
            </span>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {success && (
          <div className="cash-alert success">

            <span className="alert-icon">
              ✓
            </span>

            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ==================================================
            WALLET SUMMARY
        ================================================== */}

        <div className="cash-summary-grid">

          <div className="cash-summary-card">

            <div className="summary-icon">
              ₹
            </div>

            <div>
              <span>
                Total Collected
              </span>

              <strong>
                {formatCurrency(
                  totalCollected
                )}
              </strong>

              <small>
                Member cash
              </small>
            </div>

          </div>

          <div className="cash-summary-card available-card">

            <div className="summary-icon">
              ✓
            </div>

            <div>
              <span>
                Available Balance
              </span>

              <strong>
                {formatCurrency(
                  availableBalance
                )}
              </strong>

              <small>
                Ready to transfer
              </small>
            </div>

          </div>

          <div className="cash-summary-card pending-card">

            <div className="summary-icon">
              ⏳
            </div>

            <div>
              <span>
                Pending Transfer
              </span>

              <strong>
                {formatCurrency(
                  pendingBalance
                )}
              </strong>

              <small>
                Awaiting approval
              </small>
            </div>

          </div>

          <div className="cash-summary-card">

            <div className="summary-icon">
              ⇄
            </div>

            <div>
              <span>
                Total Transferred
              </span>

              <strong>
                {formatCurrency(
                  approvedTransferred
                )}
              </strong>

              <small>
                Approved transfers
              </small>
            </div>

          </div>

        </div>

        {/* ==================================================
            CASH FLOW
        ================================================== */}

        <div className="cash-flow-banner">

          <div className="cash-flow-item active">

            <div className="cash-flow-number">
              1
            </div>

            <div>
              <strong>
                Member
              </strong>

              <span>
                Pays cash
              </span>
            </div>

          </div>

          <div className="cash-flow-arrow">
            →
          </div>

          <div className="cash-flow-item active">

            <div className="cash-flow-number">
              2
            </div>

            <div>
              <strong>
                Team Leader
              </strong>

              <span>
                Cash Wallet
              </span>
            </div>

          </div>

          <div className="cash-flow-arrow">
            →
          </div>

          <div className="cash-flow-item pending">

            <div className="cash-flow-number">
              3
            </div>

            <div>
              <strong>
                Cash Manager
              </strong>

              <span>
                Approval
              </span>
            </div>

          </div>

          <div className="cash-flow-arrow">
            →
          </div>

          <div className="cash-flow-item">

            <div className="cash-flow-number">
              4
            </div>

            <div>
              <strong>
                Admin
              </strong>

              <span>
                Final receipt
              </span>
            </div>

          </div>

        </div>

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="cash-main-grid">

          {/* ==================================================
              TRANSFER FORM
          ================================================== */}

          <div className="cash-card">

            <div className="cash-card-header">

              <div>
                <h2>
                  Transfer Cash
                </h2>

                <p>
                  Submit collected cash
                  to a Cash Manager.
                </p>
              </div>

              <div className="available-badge">
                Available{" "}
                {formatCurrency(
                  availableBalance
                )}
              </div>

            </div>

            <form
              onSubmit={
                handleTransfer
              }
              className="cash-form"
            >

              {/* CASH MANAGER */}

              <div className="form-group">

                <label>
                  Cash Manager
                </label>

                <select
                  value={
                    cashManagerId
                  }
                  onChange={(e) =>
                    setCashManagerId(
                      e.target.value
                    )
                  }
                  disabled={
                    submitting
                  }
                >

                  <option value="">
                    Select Cash Manager
                  </option>

                  {managers.map(
                    (manager) => (
                      <option
                        key={
                          manager._id
                        }
                        value={
                          manager._id
                        }
                      >
                        {manager.name ||
                          "Cash Manager"}

                        {manager.phone
                          ? ` — ${manager.phone}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

                {managers.length ===
                  0 && (
                  <small className="field-help error-text">
                    No active Cash
                    Manager found.
                  </small>
                )}

              </div>

              {/* AMOUNT */}

              <div className="form-group">

                <label>
                  Amount
                </label>

                <div className="amount-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) =>
                      setAmount(
                        e.target.value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />

                </div>

                <small className="field-help">
                  Maximum available:{" "}
                  {formatCurrency(
                    availableBalance
                  )}
                </small>

              </div>

              {/* NOTE */}

              <div className="form-group">

                <label>
                  Note{" "}
                  <span>
                    (Optional)
                  </span>
                </label>

                <textarea
                  rows="3"
                  placeholder="Enter transfer note..."
                  value={note}
                  onChange={(e) =>
                    setNote(
                      e.target.value
                    )
                  }
                  disabled={
                    submitting
                  }
                />

              </div>

              {/* TRANSFER PREVIEW */}

              <div className="transfer-info">

                <div>
                  <span>
                    Transfer amount
                  </span>

                  <strong>
                    {formatCurrency(
                      amount
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Balance after submission
                  </span>

                  <strong>
                    {formatCurrency(
                      Math.max(
                        0,
                        availableBalance -
                          Number(
                            amount || 0
                          )
                      )
                    )}
                  </strong>
                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="transfer-submit-btn"
                disabled={
                  submitting ||
                  managers.length ===
                    0 ||
                  availableBalance <=
                    0
                }
              >

                {submitting ? (
                  <>
                    <span className="button-spinner"></span>

                    Submitting...
                  </>
                ) : (
                  <>
                    Transfer Cash

                    <span>
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

          </div>

          {/* ==================================================
              INFORMATION CARD
          ================================================== */}

          <div className="cash-card flow-card">

            <div className="cash-card-header">

              <div>
                <h2>
                  Approval Process
                </h2>

                <p>
                  How your cash moves
                </p>
              </div>

            </div>

            <div className="approval-process">

              <div className="approval-step">

                <div className="approval-icon">
                  ₹
                </div>

                <div>
                  <strong>
                    Cash collected
                  </strong>

                  <span>
                    Member pays Team
                    Leader.
                  </span>
                </div>

              </div>

              <div className="approval-step">

                <div className="approval-icon">
                  ⇄
                </div>

                <div>
                  <strong>
                    Transfer submitted
                  </strong>

                  <span>
                    Amount moves from
                    available to pending.
                  </span>
                </div>

              </div>

              <div className="approval-step">

                <div className="approval-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Cash Manager approval
                  </strong>

                  <span>
                    Cash becomes available
                    to Cash Manager only
                    after approval.
                  </span>
                </div>

              </div>

              <div className="approval-step">

                <div className="approval-icon">
                  🏦
                </div>

                <div>
                  <strong>
                    Admin
                  </strong>

                  <span>
                    Remaining cash is
                    transferred to Admin.
                  </span>
                </div>

              </div>

            </div>

            <div className="flow-note">

              <strong>
                Important
              </strong>

              <p>
                A submitted transfer is
                not immediately received
                by the Cash Manager. It
                remains pending until the
                Cash Manager approves it.
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            TRANSFER HISTORY
        ================================================== */}

        <div className="cash-card history-card">

          <div className="cash-card-header">

            <div>
              <h2>
                Transfer History
              </h2>

              <p>
                Cash transferred to Cash
                Managers
              </p>
            </div>

            <span className="history-count">
              {transfers.length}
            </span>

          </div>

          {transfers.length ===
          0 ? (
            <div className="empty-state">

              <div>
                ⇄
              </div>

              <h3>
                No transfers yet
              </h3>

              <p>
                Your submitted cash
                transfers will appear
                here.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>
                      Date
                    </th>

                    <th>
                      Cash Manager
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Transaction ID
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Note
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {transfers.map(
                    (item) => {

                      const displayStatus =
                        getDisplayStatus(
                          item.status
                        );

                      return (
                        <tr
                          key={
                            item._id
                          }
                        >

                          <td>
                            {formatDate(
                              item.createdAt
                            )}
                          </td>

                          <td>

                            <div className="person-cell">

                              <strong>
                                {item.to
                                  ?.name ||
                                  "Cash Manager"}
                              </strong>

                              {item.to
                                ?.phone && (
                                <span>
                                  {
                                    item
                                      .to
                                      .phone
                                  }
                                </span>
                              )}

                            </div>

                          </td>

                          <td>

                            <strong className="amount-cell">
                              {formatCurrency(
                                item.amount
                              )}
                            </strong>

                          </td>

                          <td>

                            <span className="transaction-id">
                              {item.transactionId ||
                                "-"}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`status-badge ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {displayStatus}
                            </span>

                          </td>

                          <td>
                            {item.note ||
                              "-"}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ==================================================
            COLLECTION HISTORY
        ================================================== */}

        <div className="cash-card history-card">

          <div className="cash-card-header">

            <div>
              <h2>
                Cash Collection History
              </h2>

              <p>
                Cash collected from
                members
              </p>
            </div>

            <span className="history-count">
              {collections.length}
            </span>

          </div>

          {collections.length ===
          0 ? (
            <div className="empty-state">

              <div>
                ₹
              </div>

              <h3>
                No collections yet
              </h3>

              <p>
                Member cash collections
                will appear here.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>
                      Date
                    </th>

                    <th>
                      Member
                    </th>

                    <th>
                      Order
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Transaction ID
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {collections.map(
                    (item) => {

                      const orderTotal =
                        item.order
                          ?.total;

                      return (
                        <tr
                          key={
                            item._id
                          }
                        >

                          <td>
                            {formatDate(
                              item.createdAt
                            )}
                          </td>

                          <td>

                            <div className="person-cell">

                              <strong>
                                {item.from
                                  ?.name ||
                                  "Member"}
                              </strong>

                              {item.from
                                ?.phone && (
                                <span>
                                  {
                                    item
                                      .from
                                      .phone
                                  }
                                </span>
                              )}

                            </div>

                          </td>

                          <td>

                            <span className="order-reference">
                              {orderTotal !==
                              undefined
                                ? formatCurrency(
                                    orderTotal
                                  )
                                : "-"}
                            </span>

                          </td>

                          <td>

                            <strong className="amount-cell">
                              {formatCurrency(
                                item.amount
                              )}
                            </strong>

                          </td>

                          <td>

                            <span
                              className={`status-badge ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {getDisplayStatus(
                                item.status
                              )}
                            </span>

                          </td>

                          <td>

                            <span className="transaction-id">
                              {item.transactionId ||
                                "-"}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default CashTransfer;
