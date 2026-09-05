import React, { useEffect, useState } from "react";
import "./PendingTransfers.css";

const API = "https://students-and-women-empower.onrender.com/api";

function PendingTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem("token");

  const loadTransfers = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/cash/cash-manager/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load transfers");
      }

      setTransfers(
        Array.isArray(data)
          ? data
          : data.transfers || data.transactions || data.data || []
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const processTransfer = async (id, action) => {
    const confirmText =
      action === "approve"
        ? "Approve this cash transfer?"
        : "Reject this cash transfer?";

    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      setProcessingId(id);
      setMessage("");

      const res = await fetch(
        `${API}/cash/cash-manager/${id}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Action failed");
      }

      setMessage(
        action === "approve"
          ? "Cash transfer approved successfully."
          : "Cash transfer rejected successfully."
      );

      loadTransfers();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const totalPending = transfers.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="cm-page">
        <div className="cm-loading-card">
          <div className="cm-spinner"></div>
          <h3>Loading pending transfers...</h3>
          <p>Please wait while we fetch the latest requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page">
      {/* Header */}
      <div className="cm-header">
        <div className="cm-title-section">
          <div className="cm-title-icon">₹</div>

          <div>
            <div className="cm-eyebrow">CASH MANAGEMENT</div>
            <h1>Pending Cash Transfers</h1>
            <p>Review and manage Team Leader → Cash Manager requests.</p>
          </div>
        </div>

        <button
          className="cm-refresh-btn"
          onClick={loadTransfers}
          disabled={loading}
        >
          <span>↻</span>
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="cm-summary-grid">
        <div className="cm-summary-card">
          <div className="cm-summary-icon pending">⏳</div>

          <div>
            <span>Pending Requests</span>
            <strong>{transfers.length}</strong>
          </div>
        </div>

        <div className="cm-summary-card">
          <div className="cm-summary-icon money">₹</div>

          <div>
            <span>Total Pending Amount</span>
            <strong>
              ₹{totalPending.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`cm-message ${
            message.toLowerCase().includes("success")
              ? "success"
              : "error"
          }`}
        >
          <span>
            {message.toLowerCase().includes("success") ? "✓" : "!"}
          </span>
          {message}
        </div>
      )}

      {/* Main Card */}
      <div className="cm-content-card">
        <div className="cm-card-header">
          <div>
            <h2>Transfer Requests</h2>
            <p>
              {transfers.length
                ? `${transfers.length} request${
                    transfers.length > 1 ? "s" : ""
                  } waiting for approval`
                : "No requests waiting for approval"}
            </p>
          </div>

          <div className="cm-status-indicator">
            <span></span>
            Live
          </div>
        </div>

        {transfers.length === 0 ? (
          <div className="cm-empty">
            <div className="cm-empty-icon">✓</div>

            <h3>All caught up!</h3>

            <p>
              There are currently no pending cash transfer requests.
            </p>

            <button
              className="cm-refresh-btn"
              onClick={loadTransfers}
            >
              <span>↻</span>
              Check Again
            </button>
          </div>
        ) : (
          <div className="cm-table-wrapper">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>TEAM LEADER</th>
                  <th>CONTACT</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>REQUESTED</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {transfers.map((item) => {
                  const from = item.from || {};

                  const date = item.createdAt
                    ? new Date(item.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";

                  const isProcessing = processingId === item._id;

                  return (
                    <tr key={item._id}>
                      {/* Team Leader */}
                      <td>
                        <div className="cm-user">
                          <div className="cm-avatar">
                            {(from.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="cm-user-info">
                            <strong>
                              {from.name || "Unknown User"}
                            </strong>

                            <small>
                              Team Leader
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="cm-contact">
                          <span className="cm-phone-icon">☎</span>
                          {from.phone || "Not available"}
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <div className="cm-amount">
                          ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="cm-badge submitted">
                          <span></span>
                          {item.status || "SUBMITTED"}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="cm-date">
                          {date}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="cm-actions">
                          <button
                            className="cm-btn approve"
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
                                <span className="cm-btn-spinner"></span>
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
                            className="cm-btn reject"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Flow Information */}
      <div className="cm-flow-card">
        <div className="cm-flow-title">
          <span>ⓘ</span>
          Cash Transfer Flow
        </div>

        <div className="cm-flow">
          <div className="cm-flow-step">
            <div className="cm-flow-number">1</div>
            <div>
              <strong>Team Leader</strong>
              <small>Collects member cash</small>
            </div>
          </div>

          <div className="cm-flow-line"></div>

          <div className="cm-flow-step active">
            <div className="cm-flow-number">2</div>
            <div>
              <strong>Cash Manager</strong>
              <small>Reviews & approves</small>
            </div>
          </div>

          <div className="cm-flow-line"></div>

          <div className="cm-flow-step">
            <div className="cm-flow-number">3</div>
            <div>
              <strong>Admin</strong>
              <small>Receives remaining cash</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingTransfers;
