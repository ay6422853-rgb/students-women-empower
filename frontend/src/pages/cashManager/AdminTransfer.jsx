import React, { useEffect, useState } from "react";
import "./AdminTransfer.css";

const API =
  import.meta.env.VITE_API_URL ||
  "https://students-and-women-empower.onrender.com/api";

function AdminCashTransfer() {
  const [wallet, setWallet] = useState(null);
  const [transfers, setTransfers] = useState([]);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] =
    useState(false);

  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const request = async (url, options = {}) => {
    const res = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
        data.message ||
          data.error ||
          `Request failed (${res.status})`
      );
    }

    return data;
  };

  const loadWallet = async () => {
    const data = await request(
      "/cash/cash-manager/wallet"
    );

    const currentWallet =
      data.wallet ||
      data.cashWallet ||
      data.data ||
      data;

    setWallet(currentWallet || null);
  };

  const loadTransfers = async () => {
    const data = await request(
      "/cash/my-transfers"
    );

    const list = Array.isArray(data)
      ? data
      : data.transfers ||
        data.transactions ||
        data.data ||
        [];

    const adminTransfers = list.filter(
      (item) =>
        String(item.type || "").toUpperCase() ===
        "CASH_MANAGER_TO_ADMIN"
    );

    setTransfers(adminTransfers);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      await Promise.all([
        loadWallet(),
        loadTransfers(),
      ]);
    } catch (error) {
      console.error(
        "Admin cash transfer loading error:",
        error
      );

      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableBalance = Number(
    wallet?.availableBalance || 0
  );

  const pendingBalance = Number(
    wallet?.pendingBalance || 0
  );

  const totalReceived = Number(
    wallet?.totalReceived || 0
  );

  const totalTransferred = Number(
    wallet?.totalTransferred || 0
  );

  const submitTransfer = async (e) => {
    e.preventDefault();

    const transferAmount = Number(amount);

    if (!transferAmount || transferAmount <= 0) {
      setMessage(
        "Please enter a valid transfer amount."
      );
      return;
    }

    if (transferAmount > availableBalance) {
      setMessage(
        `Insufficient available balance. You can transfer maximum ₹${availableBalance.toLocaleString(
          "en-IN"
        )}.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Transfer ₹${transferAmount.toLocaleString(
        "en-IN"
      )} to Admin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setTransferring(true);
      setMessage("");

      const result = await request(
        "/cash/cash-manager/admin-transfer",
        {
          method: "POST",
          body: JSON.stringify({
            amount: transferAmount,
            note:
              note.trim() ||
              "Cash Manager to Admin transfer",
          }),
        }
      );

      console.log(
        "Cash Manager → Admin transfer response:",
        result
      );

      setMessage(
        `₹${transferAmount.toLocaleString(
          "en-IN"
        )} transfer submitted successfully. Waiting for Admin approval.`
      );

      setAmount("");
      setNote("");

      await loadData();
    } catch (error) {
      console.error(
        "Admin transfer error:",
        error
      );

      setMessage(error.message);
    } finally {
      setTransferring(false);
    }
  };

  const pendingTransfers = transfers.filter(
    (item) =>
      String(item.status || "").toUpperCase() ===
      "SUBMITTED"
  );

  const approvedTransfers = transfers.filter(
    (item) =>
      String(item.status || "").toUpperCase() ===
      "APPROVED"
  );

  const rejectedTransfers = transfers.filter(
    (item) =>
      String(item.status || "").toUpperCase() ===
      "REJECTED"
  );

  const pendingAmount =
    pendingTransfers.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  if (loading) {
    return (
      <div className="act-page">
        <div className="act-loading-card">
          <div className="act-spinner"></div>

          <h3>
            Loading Cash Manager Wallet...
          </h3>

          <p>
            Fetching available cash and transfer
            history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="act-page">

      {/* HEADER */}
      <div className="act-header">

        <div className="act-title-wrap">

          <div className="act-title-icon">
            ₹
          </div>

          <div>
            <div className="act-eyebrow">
              CASH MANAGER
            </div>

            <h1>
              Transfer Cash to Admin
            </h1>

            <p>
              Transfer the remaining approved cash
              after commission payments.
            </p>
          </div>

        </div>

        <button
          className="act-refresh-btn"
          onClick={loadData}
          disabled={loading}
        >
          <span>↻</span>
          Refresh
        </button>

      </div>

      {/* MESSAGE */}
      {message && (
        <div
          className={`act-message ${
            message
              .toLowerCase()
              .includes("success")
              ? "success"
              : "error"
          }`}
        >
          <span>
            {message
              .toLowerCase()
              .includes("success")
              ? "✓"
              : "!"}
          </span>

          {message}
        </div>
      )}

      {/* WALLET */}
      <div className="act-wallet-card">

        <div className="act-wallet-left">

          <div className="act-wallet-icon">
            ₹
          </div>

          <div>
            <span>
              AVAILABLE CASH
            </span>

            <strong>
              ₹
              {availableBalance.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Available for Admin transfer
            </small>
          </div>

        </div>

        <div className="act-wallet-right">

          <div>
            <span>Pending</span>
            <strong>
              ₹
              {pendingBalance.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Total Received</span>
            <strong>
              ₹
              {totalReceived.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Total Transferred</span>
            <strong>
              ₹
              {totalTransferred.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="act-stats">

        <div className="act-stat-card">
          <span>Pending Requests</span>
          <strong>
            {pendingTransfers.length}
          </strong>
        </div>

        <div className="act-stat-card">
          <span>Pending Amount</span>
          <strong>
            ₹
            {pendingAmount.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div className="act-stat-card">
          <span>Approved Transfers</span>
          <strong>
            {approvedTransfers.length}
          </strong>
        </div>

        <div className="act-stat-card">
          <span>Rejected Transfers</span>
          <strong>
            {rejectedTransfers.length}
          </strong>
        </div>

      </div>

      {/* TRANSFER FORM */}
      <div className="act-main-grid">

        <div className="act-transfer-card">

          <div className="act-card-header">
            <div>
              <h2>
                New Admin Transfer
              </h2>

              <p>
                Money will remain pending until
                Admin accepts it.
              </p>
            </div>

            <div className="act-lock">
              🔒
            </div>
          </div>

          <form
            onSubmit={submitTransfer}
            className="act-form"
          >

            <div className="act-available-box">
              <span>
                Transferable Balance
              </span>

              <strong>
                ₹
                {availableBalance.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <label>
              Transfer Amount
            </label>

            <div className="act-input-money">
              <span>₹</span>

              <input
                type="number"
                min="1"
                max={availableBalance}
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />
            </div>

            <div className="act-quick-buttons">

              <button
                type="button"
                onClick={() =>
                  setAmount(
                    availableBalance
                  )
                }
              >
                Transfer Full Balance
              </button>

              <button
                type="button"
                onClick={() =>
                  setAmount("")
                }
              >
                Clear
              </button>

            </div>

            <label>
              Note
            </label>

            <textarea
              placeholder="Optional transfer note..."
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              rows="4"
            />

            <button
              type="submit"
              className="act-submit-btn"
              disabled={
                transferring ||
                availableBalance <= 0
              }
            >
              {transferring ? (
                <>
                  <span className="act-btn-spinner"></span>
                  Submitting Transfer...
                </>
              ) : (
                <>
                  <span>₹</span>
                  Submit to Admin
                </>
              )}
            </button>

          </form>

        </div>

        {/* FLOW CARD */}
        <div className="act-flow-card">

          <div className="act-card-header">
            <div>
              <h2>
                Transfer Process
              </h2>

              <p>
                Two-step approval system
              </p>
            </div>
          </div>

          <div className="act-process">

            <div className="act-process-step done">
              <div className="act-process-number">
                1
              </div>

              <div>
                <strong>
                  Cash Manager Wallet
                </strong>

                <small>
                  Cash is available after
                  Team Leader approval.
                </small>
              </div>
            </div>

            <div className="act-process-line"></div>

            <div className="act-process-step active">
              <div className="act-process-number">
                2
              </div>

              <div>
                <strong>
                  Admin Transfer
                </strong>

                <small>
                  Submit remaining cash to Admin.
                </small>
              </div>
            </div>

            <div className="act-process-line"></div>

            <div className="act-process-step">
              <div className="act-process-number">
                3
              </div>

              <div>
                <strong>
                  Admin Approval
                </strong>

                <small>
                  Admin accepts or rejects
                  the transfer.
                </small>
              </div>
            </div>

            <div className="act-process-line"></div>

            <div className="act-process-step">
              <div className="act-process-number">
                4
              </div>

              <div>
                <strong>
                  Company Cash
                </strong>

                <small>
                  Cash becomes available
                  in Admin wallet.
                </small>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* HISTORY */}
      <div className="act-history-card">

        <div className="act-card-header">

          <div>
            <h2>
              Admin Transfer History
            </h2>

            <p>
              Cash Manager → Admin transactions
            </p>
          </div>

          <div className="act-live">
            <span></span>
            Live
          </div>

        </div>

        {transfers.length === 0 ? (
          <div className="act-empty">
            <div className="act-empty-icon">
              ₹
            </div>

            <h3>
              No Admin transfers yet
            </h3>

            <p>
              Your Cash Manager → Admin transfer
              history will appear here.
            </p>
          </div>
        ) : (
          <div className="act-table-wrapper">

            <table className="act-table">

              <thead>
                <tr>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>TRANSACTION ID</th>
                  <th>NOTE</th>
                  <th>DATE</th>
                </tr>
              </thead>

              <tbody>

                {transfers.map((item) => {

                  const status =
                    String(
                      item.status || ""
                    ).toUpperCase();

                  const date =
                    item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-";

                  return (
                    <tr key={item._id}>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            item.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`act-status ${status.toLowerCase()}`}
                        >
                          <span></span>
                          {status}
                        </span>
                      </td>

                      <td>
                        <span className="act-txid">
                          {item.transactionId ||
                            item._id?.slice(-10) ||
                            "-"}
                        </span>
                      </td>

                      <td>
                        {item.note || "-"}
                      </td>

                      <td>
                        {date}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default AdminCashTransfer;
