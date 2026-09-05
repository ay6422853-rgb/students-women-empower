import React, { useEffect, useMemo, useState } from "react";
import "./AdminTransfers.css";

const API =
  import.meta.env.VITE_API_URL ||
  "https://students-and-women-empower.onrender.com/api";

function AdminTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [search, setSearch] = useState("");

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

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [pendingData, walletData] = await Promise.all([
        request("/cash/admin/pending"),
        request("/cash/admin/wallet"),
      ]);

      const list = Array.isArray(pendingData)
        ? pendingData
        : pendingData.transactions ||
          pendingData.transfers ||
          pendingData.data ||
          [];

      setTransfers(Array.isArray(list) ? list : []);

      setWallet(
        walletData?.wallet ||
          walletData?.cashWallet ||
          walletData?.data ||
          walletData ||
          null
      );
    } catch (error) {
      console.error("Admin transfer loading error:", error);
      setMessage(error.message);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const processTransfer = async (id, action) => {
    const isApprove = action === "approve";

    const confirmText = isApprove
      ? "Are you sure you want to approve this Cash Manager transfer?"
      : "Are you sure you want to reject this Cash Manager transfer?";

    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      setProcessingId(id);
      setMessage("");

      await request(`/cash/admin/${id}/${action}`, {
        method: "PATCH",
      });

      setMessage(
        isApprove
          ? "Cash Manager transfer approved successfully."
          : "Cash Manager transfer rejected successfully."
      );

      await loadData();
    } catch (error) {
      console.error(`Admin transfer ${action} error:`, error);
      setMessage(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTransfers = useMemo(() => {
    let result = [...transfers];

    if (statusFilter) {
      result = result.filter(
        (item) =>
          String(item.status || "").toUpperCase() ===
          statusFilter
      );
    }

    const query = search.trim().toLowerCase();

    if (!query) {
      return result;
    }

    return result.filter((item) => {
      const from = item.from || {};

      return (
        String(from.name || "")
          .toLowerCase()
          .includes(query) ||
        String(from.phone || "")
          .toLowerCase()
          .includes(query) ||
        String(from.email || "")
          .toLowerCase()
          .includes(query) ||
        String(item.amount || "")
          .toLowerCase()
          .includes(query) ||
        String(item.status || "")
          .toLowerCase()
          .includes(query) ||
        String(item.transactionId || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [transfers, statusFilter, search]);

  const pendingAmount = transfers
    .filter(
      (item) =>
        String(item.status || "").toUpperCase() ===
        "SUBMITTED"
    )
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const approvedAmount = transfers
    .filter(
      (item) =>
        String(item.status || "").toUpperCase() ===
        "APPROVED"
    )
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const availableBalance = Number(
    wallet?.availableBalance || 0
  );

  const totalReceived = Number(
    wallet?.totalReceived || 0
  );

  if (loading) {
    return (
      <div className="admin-transfer-page">
        <div className="admin-loading-card">
          <div className="admin-spinner"></div>

          <h3>Loading Admin Cash Control...</h3>

          <p>
            Fetching Cash Manager transfers and Admin wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-transfer-page">

      {/* HEADER */}
      <div className="admin-transfer-header">
        <div className="admin-title-wrap">
          <div className="admin-title-icon">₹</div>

          <div>
            <div className="admin-eyebrow">
              ADMIN CASH CONTROL
            </div>

            <h1>Admin Cash Transfers</h1>

            <p>
              Receive and manage cash transferred by Cash Managers.
            </p>
          </div>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadData}
        >
          <span>↻</span>
          Refresh
        </button>
      </div>

      {/* WALLET + STATS */}
      <div className="admin-stat-grid">

        <div className="admin-stat-card wallet">
          <div className="admin-stat-icon blue">
            ₹
          </div>

          <div>
            <span>Admin Available Cash</span>
            <strong>
              ₹{availableBalance.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            ⏳
          </div>

          <div>
            <span>Pending Requests</span>
            <strong>
              {
                transfers.filter(
                  (item) =>
                    String(item.status || "").toUpperCase() ===
                    "SUBMITTED"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            ✓
          </div>

          <div>
            <span>Total Received</span>
            <strong>
              ₹{totalReceived.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            ₹
          </div>

          <div>
            <span>Pending Amount</span>
            <strong>
              ₹{pendingAmount.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

      </div>

      {/* MESSAGE */}
      {message && (
        <div
          className={`admin-message ${
            message.toLowerCase().includes("success")
              ? "success"
              : "error"
          }`}
        >
          <span>
            {message.toLowerCase().includes("success")
              ? "✓"
              : "!"}
          </span>

          {message}
        </div>
      )}

      {/* MAIN CARD */}
      <div className="admin-transfer-card">

        <div className="admin-card-header">
          <div>
            <h2>Cash Manager Transfer Requests</h2>

            <p>
              Approve or reject money transferred by Cash Managers.
            </p>
          </div>

          <div className="admin-live">
            <span></span>
            Live
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="admin-filter-bar">

          <div className="admin-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search name, phone, amount..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="admin-filter-buttons">

            <button
              className={
                statusFilter === "SUBMITTED"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter("SUBMITTED")
              }
            >
              Pending
            </button>

            <button
              className={
                statusFilter === "APPROVED"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter("APPROVED")
              }
            >
              Approved
            </button>

            <button
              className={
                statusFilter === "REJECTED"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter("REJECTED")
              }
            >
              Rejected
            </button>

            <button
              className={
                statusFilter === ""
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter("")
              }
            >
              All
            </button>

          </div>
        </div>

        {/* TABLE */}
        {filteredTransfers.length === 0 ? (
          <div className="admin-empty">

            <div className="admin-empty-icon">
              ✓
            </div>

            <h3>No transfer requests found</h3>

            <p>
              There are no Cash Manager transfers matching
              the current filter.
            </p>

            <button
              className="admin-refresh-btn"
              onClick={loadData}
            >
              <span>↻</span>
              Refresh
            </button>

          </div>
        ) : (
          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>CASH MANAGER</th>
                  <th>CONTACT</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>REQUESTED</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransfers.map((item) => {

                  const from = item.from || {};

                  const status =
                    String(
                      item.status || ""
                    ).toUpperCase();

                  const date = item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";

                  const isProcessing =
                    processingId === item._id;

                  return (
                    <tr key={item._id}>

                      {/* CASH MANAGER */}
                      <td>
                        <div className="admin-user">

                          <div className="admin-avatar">
                            {(
                              from.name || "C"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {from.name ||
                                "Unknown User"}
                            </strong>

                            <small>
                              Cash Manager
                            </small>
                          </div>

                        </div>
                      </td>

                      {/* CONTACT */}
                      <td>
                        <div className="admin-contact">
                          <span>☎</span>

                          {from.phone ||
                            "Not available"}
                        </div>

                        {from.email && (
                          <div className="admin-email">
                            {from.email}
                          </div>
                        )}
                      </td>

                      {/* AMOUNT */}
                      <td>
                        <div className="admin-amount">
                          ₹
                          {Number(
                            item.amount || 0
                          ).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`admin-status ${status.toLowerCase()}`}
                        >
                          <span></span>

                          {status || "UNKNOWN"}
                        </span>
                      </td>

                      {/* DATE */}
                      <td>
                        <div className="admin-date">
                          {date}
                        </div>
                      </td>

                      {/* ACTION */}
                      <td>

                        {status === "SUBMITTED" ? (
                          <div className="admin-actions">

                            <button
                              className="admin-btn approve"
                              disabled={isProcessing}
                              onClick={() =>
                                processTransfer(
                                  item._id,
                                  "approve"
                                )
                              }
                            >
                              {isProcessing ? (
                                <>
                                  <span className="admin-btn-spinner"></span>
                                  Processing
                                </>
                              ) : (
                                <>
                                  <span>✓</span>
                                  Approve
                                </>
                              )}
                            </button>

                            <button
                              className="admin-btn reject"
                              disabled={isProcessing}
                              onClick={() =>
                                processTransfer(
                                  item._id,
                                  "reject"
                                )
                              }
                            >
                              <span>×</span>
                              Reject
                            </button>

                          </div>
                        ) : (
                          <span className="admin-processed">
                            {status === "APPROVED"
                              ? "Approved"
                              : "Rejected"}
                          </span>
                        )}

                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* CASH FLOW */}
      <div className="admin-flow-card">

        <div className="admin-flow-title">
          <span>ⓘ</span>
          Cash Transfer Flow
        </div>

        <div className="admin-flow">

          <div className="admin-flow-step">
            <div className="admin-flow-number">
              1
            </div>

            <div>
              <strong>Cash Manager</strong>
              <small>
                Transfers remaining cash
              </small>
            </div>
          </div>

          <div className="admin-flow-line"></div>

          <div className="admin-flow-step active">
            <div className="admin-flow-number">
              2
            </div>

            <div>
              <strong>Admin</strong>
              <small>
                Reviews & accepts
              </small>
            </div>
          </div>

          <div className="admin-flow-line"></div>

          <div className="admin-flow-step">
            <div className="admin-flow-number">
              3
            </div>

            <div>
              <strong>Company</strong>
              <small>
                Final cash received
              </small>
            </div>
          </div>

        </div>

        <div className="admin-flow-note">
          <strong>Important:</strong> Until Admin approves the
          transfer, the amount remains pending in the Cash
          Manager's wallet. After approval, the amount is added
          to the Admin CashWallet.
        </div>

      </div>

    </div>
  );
}

export default AdminTransfers;
