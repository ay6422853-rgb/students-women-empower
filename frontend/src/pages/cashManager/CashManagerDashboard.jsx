import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CashManagerDashboard.css";

const API = "http://localhost:5000/api";

function CashManagerDashboard() {
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [wallet, setWallet] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    totalCollected: 0,
    totalReceived: 0,
    totalTransferred: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const request = async (url) => {
    const res = await fetch(`${API}${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || `Request failed: ${url}`
      );
    }

    return data;
  };

  const normalizeArray = (data, keys = []) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return [];
  };

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * Dashboard APIs are loaded separately.
       * So if commissions API has an issue,
       * Cash Manager wallet will still load.
       */

      const results = await Promise.allSettled([
        request("/cash/cash-manager/pending"),
        request("/cash/cash-manager/wallet"),
        request("/commissions"),
      ]);

      // ==========================================
      // PENDING TRANSFERS
      // ==========================================

      if (results[0].status === "fulfilled") {
        const data = results[0].value;

        setPendingTransfers(
          normalizeArray(data, [
            "transactions",
            "transfers",
            "data",
          ])
        );
      } else {
        console.error(
          "Pending transfers error:",
          results[0].reason
        );
      }

      // ==========================================
      // CASH MANAGER WALLET
      // ==========================================

      if (results[1].status === "fulfilled") {
        const data = results[1].value;

        const walletData =
          data?.wallet ||
          data?.cashWallet ||
          data?.data ||
          data;

        setWallet({
          availableBalance: Number(
            walletData?.availableBalance || 0
          ),

          pendingBalance: Number(
            walletData?.pendingBalance || 0
          ),

          totalCollected: Number(
            walletData?.totalCollected || 0
          ),

          totalReceived: Number(
            walletData?.totalReceived || 0
          ),

          totalTransferred: Number(
            walletData?.totalTransferred || 0
          ),
        });
      } else {
        console.error(
          "Cash wallet error:",
          results[1].reason
        );
      }

      // ==========================================
      // COMMISSIONS
      // ==========================================

      if (results[2].status === "fulfilled") {
        const data = results[2].value;

        setCommissions(
          normalizeArray(data, [
            "commissions",
            "data",
          ])
        );
      } else {
        console.error(
          "Commission error:",
          results[2].reason
        );
      }
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const pendingAmount =
    pendingTransfers.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const availableCommission =
    commissions
      .filter(
        (item) =>
          String(item.status).toUpperCase() ===
          "AVAILABLE"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="cm-dashboard-page">
        <div className="cm-dashboard-loading">
          <div className="cm-loading-spinner"></div>

          <h3>
            Loading Cash Manager Dashboard
          </h3>

          <p>
            Fetching wallet and transfer
            information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-dashboard-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="cm-dashboard-header">
        <div className="cm-dashboard-heading">

          <div className="cm-dashboard-icon">
            ₹
          </div>

          <div>
            <span className="cm-dashboard-eyebrow">
              CASH MANAGEMENT
            </span>

            <h1>
              Cash Manager Dashboard
            </h1>

            <p>
              Manage received cash, commission
              payments and Admin transfers.
            </p>
          </div>
        </div>

        <button
          className="cm-dashboard-refresh"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <span
            className={
              refreshing
                ? "cm-refresh-spin"
                : ""
            }
          >
            ↻
          </span>

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="cm-dashboard-error">
          <span>!</span>
          <div>
            <strong>
              Some dashboard data could not
              be loaded.
            </strong>

            <small>{error}</small>
          </div>
        </div>
      )}

      {/* ======================================
          WALLET BALANCE
      ====================================== */}

      <div className="cm-wallet-main-card">

        <div className="cm-wallet-main-left">

          <div className="cm-wallet-label">
            AVAILABLE CASH BALANCE
          </div>

          <div className="cm-wallet-amount">
            ₹{formatMoney(wallet.availableBalance)}
          </div>

          <p>
            Cash currently available with you
            for commission payment and Admin
            transfer.
          </p>
        </div>

        <div className="cm-wallet-main-right">

          <div className="cm-wallet-mini">
            <span>Pending with Admin</span>
            <strong>
              ₹{formatMoney(wallet.pendingBalance)}
            </strong>
          </div>

          <div className="cm-wallet-mini">
            <span>Total Received</span>
            <strong>
              ₹{formatMoney(wallet.totalReceived)}
            </strong>
          </div>

          <div className="cm-wallet-mini">
            <span>Total Transferred</span>
            <strong>
              ₹{formatMoney(wallet.totalTransferred)}
            </strong>
          </div>
        </div>
      </div>

      {/* ======================================
          STATS
      ====================================== */}

      <div className="cm-dashboard-stats">

        <div className="cm-dashboard-stat-card">
          <div className="cm-stat-icon cash">
            ₹
          </div>

          <div>
            <span>Available Cash</span>

            <strong>
              ₹{formatMoney(
                wallet.availableBalance
              )}
            </strong>
          </div>
        </div>

        <div className="cm-dashboard-stat-card">
          <div className="cm-stat-icon pending">
            ⏳
          </div>

          <div>
            <span>Pending Cash</span>

            <strong>
              ₹{formatMoney(
                wallet.pendingBalance
              )}
            </strong>
          </div>
        </div>

        <div className="cm-dashboard-stat-card">
          <div className="cm-stat-icon transfer">
            ⇄
          </div>

          <div>
            <span>TL Pending Transfers</span>

            <strong>
              {pendingTransfers.length}
            </strong>

            <small>
              ₹{formatMoney(pendingAmount)}
            </small>
          </div>
        </div>

        <div className="cm-dashboard-stat-card">
          <div className="cm-stat-icon commission">
            %
          </div>

          <div>
            <span>Available Commission</span>

            <strong>
              ₹{formatMoney(
                availableCommission
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="cm-dashboard-content">

        {/* LEFT */}
        <div className="cm-dashboard-main">

          <div className="cm-section-card">

            <div className="cm-section-header">

              <div>
                <span className="cm-section-label">
                  TEAM LEADER
                </span>

                <h2>
                  Pending Cash Transfers
                </h2>

                <p>
                  Review cash received from Team
                  Leaders.
                </p>
              </div>

              <Link
                to="/dashboard/cash-manager/pending-transfers"
                className="cm-view-all"
              >
                View All →
              </Link>
            </div>

            {pendingTransfers.length === 0 ? (
              <div className="cm-empty-state">

                <div className="cm-empty-icon">
                  ✓
                </div>

                <h3>
                  No Pending Transfers
                </h3>

                <p>
                  There are no Team Leader cash
                  transfers waiting for approval.
                </p>
              </div>
            ) : (
              <div className="cm-pending-list">

                {pendingTransfers
                  .slice(0, 5)
                  .map((item) => {

                    const from =
                      item.from || {};

                    const date =
                      item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-";

                    return (
                      <div
                        className="cm-pending-row"
                        key={item._id}
                      >

                        <div className="cm-pending-user">

                          <div className="cm-user-avatar">
                            {(
                              from.name ||
                              "U"
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
                              Team Leader
                            </small>
                          </div>
                        </div>

                        <div className="cm-pending-date">
                          {date}
                        </div>

                        <div className="cm-pending-amount">
                          ₹
                          {formatMoney(
                            item.amount
                          )}
                        </div>

                        <span className="cm-pending-badge">
                          PENDING
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="cm-dashboard-sidebar">

          {/* QUICK ACTIONS */}

          <div className="cm-section-card">

            <div className="cm-section-header compact">
              <div>
                <span className="cm-section-label">
                  ACTIONS
                </span>

                <h2>
                  Quick Actions
                </h2>
              </div>
            </div>

            <div className="cm-action-list">

              <Link
                to="/dashboard/cash-manager/pending-transfers"
                className="cm-action-item"
              >
                <div className="cm-action-icon pending">
                  ⏳
                </div>

                <div>
                  <strong>
                    Pending Transfers
                  </strong>

                  <small>
                    Approve or reject TL transfers
                  </small>
                </div>

                <span>→</span>
              </Link>

              <Link
                to="/dashboard/cash-manager/commissions"
                className="cm-action-item"
              >
                <div className="cm-action-icon commission">
                  %
                </div>

                <div>
                  <strong>
                    Pay Commissions
                  </strong>

                  <small>
                    Pay available commissions
                  </small>
                </div>

                <span>→</span>
              </Link>

              <Link
                to="/dashboard/cash-manager/admin-transfer"
                className="cm-action-item"
              >
                <div className="cm-action-icon admin">
                  ₹
                </div>

                <div>
                  <strong>
                    Transfer to Admin
                  </strong>

                  <small>
                    Send available cash to Admin
                  </small>
                </div>

                <span>→</span>
              </Link>

              <Link
                to="/dashboard/cash-manager/admin-transfer-history"
                className="cm-action-item"
              >
                <div className="cm-action-icon history">
                  ↺
                </div>

                <div>
                  <strong>
                    Transfer History
                  </strong>

                  <small>
                    View Admin transfer history
                  </small>
                </div>

                <span>→</span>
              </Link>
            </div>
          </div>

          {/* CASH SUMMARY */}

          <div className="cm-section-card cm-summary-card">

            <div className="cm-section-header compact">
              <div>
                <span className="cm-section-label">
                  CASH SUMMARY
                </span>

                <h2>
                  Wallet Overview
                </h2>
              </div>
            </div>

            <div className="cm-summary-list">

              <div>
                <span>
                  Total Cash Received
                </span>

                <strong>
                  ₹{formatMoney(
                    wallet.totalReceived
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Total Cash Transferred
                </span>

                <strong>
                  ₹{formatMoney(
                    wallet.totalTransferred
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Pending Admin Transfer
                </span>

                <strong className="pending-text">
                  ₹{formatMoney(
                    wallet.pendingBalance
                  )}
                </strong>
              </div>

              <div className="cm-summary-total">
                <span>
                  Current Available
                </span>

                <strong>
                  ₹{formatMoney(
                    wallet.availableBalance
                  )}
                </strong>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          FLOW
      ====================================== */}

      <div className="cm-flow-card">

        <div className="cm-flow-header">
          <div className="cm-flow-info">
            <span>ⓘ</span>

            <div>
              <strong>
                Cash Management Flow
              </strong>

              <small>
                Every transfer requires approval
                before the balance moves.
              </small>
            </div>
          </div>
        </div>

        <div className="cm-flow">

          <div className="cm-flow-step">
            <div className="cm-flow-number">
              1
            </div>

            <div>
              <strong>
                Team Leader
              </strong>

              <small>
                Collects member cash
              </small>
            </div>
          </div>

          <div className="cm-flow-line"></div>

          <div className="cm-flow-step active">
            <div className="cm-flow-number">
              2
            </div>

            <div>
              <strong>
                Cash Manager
              </strong>

              <small>
                Receives & pays commissions
              </small>
            </div>
          </div>

          <div className="cm-flow-line"></div>

          <div className="cm-flow-step">
            <div className="cm-flow-number">
              3
            </div>

            <div>
              <strong>
                Admin
              </strong>

              <small>
                Receives remaining cash
              </small>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default CashManagerDashboard;