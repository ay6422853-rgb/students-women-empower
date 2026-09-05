import React, { useEffect, useState } from "react";
import "./teamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

function CashCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  async function loadCollections() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Login session not found");
      }

      const response = await fetch(
        `${API}/cash/my-collections`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("CASH COLLECTION RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load cash collections"
        );
      }

      if (Array.isArray(data.transactions)) {
        setCollections(data.transactions);
      } else if (Array.isArray(data.collections)) {
        setCollections(data.collections);
      } else {
        setCollections([]);
      }
    } catch (err) {
      console.error(
        "Cash collection error:",
        err
      );

      setError(
        err.message ||
          "Unable to load cash collections"
      );

      setCollections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  const totalCash = collections.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const totalCollections = collections.length;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const getStatusClass = (status) => {
    return String(
      status || "APPROVED"
    ).toLowerCase();
  };

  const getStatusText = (status) => {
    return status || "APPROVED";
  };

  return (
    <div className="tl-page">
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="tl-page-header">
        <div>
          <div className="tl-page-kicker">
            TEAM LEADER
          </div>

          <h1>Cash Collections</h1>

          <p>
            Track cash collected from members
            against their orders.
          </p>
        </div>

        <div className="tl-header-actions">
          <button
            type="button"
            className="tl-refresh-btn"
            onClick={loadCollections}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <div className="tl-money-badge">
            <span>Total Collected</span>
            <strong>
              {formatCurrency(totalCash)}
            </strong>
          </div>
        </div>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="tl-error">
          <span>⚠</span>
          <div>
            <strong>
              Unable to load collections
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={loadCollections}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      {!loading && !error && (
        <div className="tl-summary-grid">
          <div className="tl-summary-card">
            <div className="tl-summary-icon">
              ₹
            </div>

            <div>
              <span>Total Cash Collected</span>

              <strong>
                {formatCurrency(totalCash)}
              </strong>
            </div>
          </div>

          <div className="tl-summary-card">
            <div className="tl-summary-icon">
              #
            </div>

            <div>
              <span>Total Collections</span>

              <strong>
                {totalCollections}
              </strong>
            </div>
          </div>

          <div className="tl-summary-card">
            <div className="tl-summary-icon">
              ✓
            </div>

            <div>
              <span>Collection Status</span>

              <strong>
                {totalCollections > 0
                  ? "Recorded"
                  : "No Records"}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (
        <div className="tl-loading-card">
          <div className="tl-spinner"></div>

          <strong>
            Loading cash collections...
          </strong>

          <span>
            Please wait while we fetch your
            collection records.
          </span>
        </div>
      ) : collections.length === 0 ? (
        /* ======================================
           EMPTY STATE
        ====================================== */

        <div className="tl-empty-card">
          <div className="tl-empty-icon">
            ₹
          </div>

          <h2>No Cash Collections Yet</h2>

          <p>
            Cash collected from members will
            appear here after you record a
            collection.
          </p>
        </div>
      ) : (
        /* ======================================
           COLLECTION TABLE
        ====================================== */

        <div className="tl-table-card">
          <div className="tl-table-header">
            <div>
              <h2>Collection History</h2>

              <p>
                All cash received by you from
                members.
              </p>
            </div>

            <div className="tl-table-count">
              {totalCollections}{" "}
              {totalCollections === 1
                ? "Collection"
                : "Collections"}
            </div>
          </div>

          <div className="tl-table-wrapper">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {collections.map(
                  (item, index) => {
                    const amount = Number(
                      item.amount || 0
                    );

                    const memberName =
                      item.from?.name ||
                      item.member?.name ||
                      item.user?.name ||
                      "Member";

                    const memberPhone =
                      item.from?.phone ||
                      item.member?.phone ||
                      item.user?.phone ||
                      "";

                    const orderId =
                      item.order?._id ||
                      item.order;

                    const status =
                      item.status ||
                      "APPROVED";

                    return (
                      <tr
                        key={
                          item._id || index
                        }
                      >
                        {/* ORDER */}

                        <td>
                          <div className="tl-order-cell">
                            <strong>
                              {orderId
                                ? `#${String(
                                    orderId
                                  ).slice(-8)}`
                                : "-"}
                            </strong>

                            <span>
                              Order
                            </span>
                          </div>
                        </td>

                        {/* MEMBER */}

                        <td>
                          <div className="tl-member-cell">
                            <div className="tl-member-avatar">
                              {memberName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {memberName}
                              </strong>

                              {memberPhone && (
                                <small>
                                  {memberPhone}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* AMOUNT */}

                        <td>
                          <strong className="tl-amount">
                            {formatCurrency(
                              amount
                            )}
                          </strong>
                        </td>

                        {/* TYPE */}

                        <td>
                          <span className="tl-type-badge">
                            Member → TL
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`tl-status ${getStatusClass(
                              status
                            )}`}
                          >
                            <span className="tl-status-dot"></span>
                            {getStatusText(
                              status
                            )}
                          </span>
                        </td>

                        {/* DATE */}

                        <td>
                          <div className="tl-date-cell">
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month:
                                      "short",
                                    year:
                                      "numeric",
                                  }
                                )
                              : "-"}

                            {item.createdAt && (
                              <small>
                                {new Date(
                                  item.createdAt
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour:
                                      "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </small>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashCollections;
