import { useEffect, useState } from "react";
import "./TeamLeaderFinance.css";

const API_URL = "https://students-and-women-empower.onrender.com/api";

function Commission() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCommissions();
  }, []);

  async function loadCommissions() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/commissions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load commissions");
      }

      setCommissions(data.commissions || []);
    } catch (error) {
      console.error("Commission error:", error);
      setError(error.message || "Unable to load commissions");
    } finally {
      setLoading(false);
    }
  }

  const total = commissions.reduce(
    (sum, commission) =>
      sum + Number(commission.amount || 0),
    0
  );

  const available = commissions
    .filter((item) => item.status === "AVAILABLE")
    .reduce(
      (sum, commission) =>
        sum + Number(commission.amount || 0),
      0
    );

  const pending = commissions
    .filter((item) => item.status === "PENDING")
    .reduce(
      (sum, commission) =>
        sum + Number(commission.amount || 0),
      0
    );

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  return (
    <div className="commission-page">

      <div className="commission-header">
        <div>
          <h1>Commission</h1>
          <p>
            Track your earned commissions and commission status.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadCommissions}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}

      <div className="commission-summary">

        <div className="commission-card">
          <div className="commission-card-icon">₹</div>

          <div>
            <span>Total Commission</span>
            <strong>₹{total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="commission-card available">
          <div className="commission-card-icon">✓</div>

          <div>
            <span>Available</span>
            <strong>₹{available.toFixed(2)}</strong>
          </div>
        </div>

        <div className="commission-card pending">
          <div className="commission-card-icon">◷</div>

          <div>
            <span>Pending</span>
            <strong>₹{pending.toFixed(2)}</strong>
          </div>
        </div>

        <div className="commission-card">
          <div className="commission-card-icon">#</div>

          <div>
            <span>Total Entries</span>
            <strong>{commissions.length}</strong>
          </div>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="commission-error">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="commission-table-card">

        <div className="table-header">
          <div>
            <h2>Commission History</h2>
            <p>
              All commissions generated for your account.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="commission-loading">
            Loading commissions...
          </div>
        ) : commissions.length === 0 ? (
          <div className="commission-empty">
            <div className="empty-icon">₹</div>
            <h3>No Commission Yet</h3>
            <p>
              Your commission records will appear here.
            </p>
          </div>
        ) : (
          <div className="commission-table-wrapper">

            <table className="commission-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Source User</th>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {commissions.map((commission, index) => (

                  <tr key={commission._id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      <div className="source-user">

                        <div className="source-avatar">
                          {commission.sourceUser?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>
                            {commission.sourceUser?.name ||
                              "Unknown User"}
                          </strong>

                          <span>
                            {commission.sourceUser?.email || "-"}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      {commission.order?._id
                        ? `#${commission.order._id.slice(-6)}`
                        : "-"}
                    </td>

                    <td className="amount-cell">
                      ₹{Number(commission.amount || 0).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={`commission-status ${
                          commission.status?.toLowerCase()
                        }`}
                      >
                        {commission.status || "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      {formatDate(commission.createdAt)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Commission;
