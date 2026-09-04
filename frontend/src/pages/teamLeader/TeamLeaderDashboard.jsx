
import React, { useEffect, useState } from "react";
import "./teamLeader.css";

const API = "http://localhost:5000/api";

function TeamLeaderDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ========================================
  // LOAD TEAM LEADER DASHBOARD
  // ========================================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Login token not found. Please login again.");
      }

      const response = await fetch(
        `${API}/team-leader/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("TEAM LEADER DASHBOARD RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load Team Leader dashboard"
        );
      }

      if (!data.dashboard) {
        throw new Error("Dashboard data not received from server");
      }

      setDashboard(data.dashboard);
    } catch (error) {
      console.error("Team Leader dashboard error:", error);
      setError(error.message || "Unable to load dashboard");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="tl-page">
        <div className="tl-loading">
          Loading Team Leader Dashboard...
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="tl-page">
        <div className="tl-error">
          <strong>Dashboard Error</strong>
          <p>{error}</p>

          <button
            className="tl-btn primary"
            onClick={loadDashboard}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // SAFE DATA
  // ========================================

  const team = dashboard?.team || {};

  const stock = dashboard?.stock || {};

  const sales = dashboard?.sales || {};

  const cash = dashboard?.cash || {};

  const recentMembers =
    Array.isArray(dashboard?.recentMembers)
      ? dashboard.recentMembers
      : [];

  const recentOrders =
    Array.isArray(dashboard?.recentOrders)
      ? dashboard.recentOrders
      : [];

  // ========================================
  // USER
  // ========================================

  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userName =
    savedUser?.name || "Team Leader";

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="tl-page">

      {/* ====================================
          HEADER
      ==================================== */}

      <div className="tl-page-header">

        <div>
          <h1>
            Team Leader Dashboard
          </h1>

          <p>
            Welcome back{" "}
            <strong>
              {userName}
            </strong>
          </p>
        </div>

        <div className="tl-role-badge">
          TEAM LEADER
        </div>

      </div>


      {/* ====================================
          REFRESH
      ==================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <button
          className="tl-btn secondary"
          onClick={loadDashboard}
        >
          Refresh
        </button>
      </div>


      {/* ====================================
          TEAM STATS
      ==================================== */}

      <div className="tl-stats-grid">

        {/* MEMBERS */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            👥
          </div>

          <div>
            <span>
              My Members
            </span>

            <strong>
              {team.totalMembers || 0}
            </strong>
          </div>

        </div>


        {/* ACTIVE MEMBERS */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            🟢
          </div>

          <div>
            <span>
              Active Members
            </span>

            <strong>
              {team.activeMembers || 0}
            </strong>
          </div>

        </div>


        {/* STOCK */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            📦
          </div>

          <div>
            <span>
              Total Stock
            </span>

            <strong>
              {stock.totalUnits || 0}
            </strong>
          </div>

        </div>


        {/* PRODUCTS */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            🏷️
          </div>

          <div>
            <span>
              Products
            </span>

            <strong>
              {stock.totalProducts || 0}
            </strong>
          </div>

        </div>

      </div>


      {/* ====================================
          SALES / CASH STATS
      ==================================== */}

      <div className="tl-stats-grid">

        {/* ORDERS */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            🛒
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {sales.totalOrders || 0}
            </strong>
          </div>

        </div>


        {/* CONFIRMED ORDERS */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            ✅
          </div>

          <div>
            <span>
              Confirmed Orders
            </span>

            <strong>
              {sales.confirmedOrders || 0}
            </strong>
          </div>

        </div>


        {/* SALES */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            💰
          </div>

          <div>
            <span>
              Total Sales
            </span>

            <strong>
              ₹
              {Number(
                sales.totalSales || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        {/* CASH */}

        <div className="tl-stat-card">

          <div className="tl-stat-icon">
            💵
          </div>

          <div>
            <span>
              Cash Collected
            </span>

            <strong>
              ₹
              {Number(
                cash.totalCollected || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

      </div>


      {/* ====================================
          CASH INFORMATION
      ==================================== */}

      <div className="tl-section">

        <div className="tl-section-header">

          <h2>
            Cash Summary
          </h2>

        </div>


        <div className="tl-stats-grid">

          {/* COLLECTED */}

          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              💵
            </div>

            <div>
              <span>
                Total Collected
              </span>

              <strong>
                ₹
                {Number(
                  cash.totalCollected || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

          </div>


          {/* TRANSFERRED */}

          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              🏦
            </div>

            <div>
              <span>
                Total Transferred
              </span>

              <strong>
                ₹
                {Number(
                  cash.totalTransferred || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

          </div>


          {/* PENDING */}

          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              ⏳
            </div>

            <div>
              <span>
                Pending Transfer
              </span>

              <strong>
                ₹
                {Number(
                  cash.pendingTransfer || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

          </div>


          {/* BALANCE */}

          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              💼
            </div>

            <div>
              <span>
                Cash Balance
              </span>

              <strong>
                ₹
                {Number(
                  cash.cashBalance || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* ====================================
          STOCK STATUS
      ==================================== */}

      <div className="tl-section">

        <div className="tl-section-header">

          <h2>
            Stock Status
          </h2>

        </div>


        <div className="tl-stats-grid">

          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              📦
            </div>

            <div>
              <span>
                Total Products
              </span>

              <strong>
                {stock.totalProducts || 0}
              </strong>
            </div>

          </div>


          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              📊
            </div>

            <div>
              <span>
                Total Units
              </span>

              <strong>
                {stock.totalUnits || 0}
              </strong>
            </div>

          </div>


          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              ⚠️
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {stock.lowStock || 0}
              </strong>
            </div>

          </div>


          <div className="tl-stat-card">

            <div className="tl-stat-icon">
              🚫
            </div>

            <div>
              <span>
                Out Of Stock
              </span>

              <strong>
                {stock.outOfStock || 0}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* ====================================
          QUICK ACTIONS
      ==================================== */}

      <div className="tl-section">

        <div className="tl-section-header">

          <h2>
            Quick Actions
          </h2>

        </div>


        <div className="tl-action-grid">

          {/* MEMBERS */}

          <a
            href="/dashboard/team-leader/members"
            className="tl-action-card"
          >
            <span>👥</span>

            <strong>
              My Members
            </strong>

            <small>
              View your team members
            </small>
          </a>


          {/* STOCK */}

          <a
            href="/dashboard/team-leader/stock"
            className="tl-action-card"
          >
            <span>📦</span>

            <strong>
              My Stock
            </strong>

            <small>
              Check available stock
            </small>
          </a>


          {/* ORDERS */}

          <a
            href="/dashboard/team-leader/orders"
            className="tl-action-card"
          >
            <span>🛒</span>

            <strong>
              Orders
            </strong>

            <small>
              Manage team orders
            </small>
          </a>


          {/* CASH COLLECTION */}

          <a
            href="/dashboard/team-leader/cash-collections"
            className="tl-action-card"
          >
            <span>💵</span>

            <strong>
              Cash Collections
            </strong>

            <small>
              View collected cash
            </small>
          </a>


          {/* CASH TRANSFER */}

          <a
            href="/dashboard/team-leader/cash-transfer"
            className="tl-action-card"
          >
            <span>🏦</span>

            <strong>
              Transfer Cash
            </strong>

            <small>
              Send cash to Cash Manager
            </small>
          </a>


          {/* STOCK TRANSACTIONS */}

          <a
            href="/dashboard/team-leader/stock-transactions"
            className="tl-action-card"
          >
            <span>📊</span>

            <strong>
              Stock Transactions
            </strong>

            <small>
              View stock history
            </small>
          </a>

        </div>

      </div>


      {/* ====================================
          RECENT MEMBERS
      ==================================== */}

      <div className="tl-section">

        <div className="tl-section-header">

          <h2>
            Recent Members
          </h2>

          <a href="/dashboard/team-leader/members">
            View All
          </a>

        </div>


        {recentMembers.length === 0 ? (

          <div className="tl-empty">
            No members found.
          </div>

        ) : (

          <div className="tl-table-wrapper">

            <table className="tl-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    City
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Joined
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentMembers
                  .slice(0, 5)
                  .map((member) => (

                    <tr
                      key={member._id}
                    >

                      <td>
                        <strong>
                          {member.name || "-"}
                        </strong>
                      </td>

                      <td>
                        {member.phone || "-"}
                      </td>

                      <td>
                        {member.city || "-"}
                      </td>

                      <td>

                        <span
                          className={`tl-status ${
                            String(
                              member.status || ""
                            ).toLowerCase()
                          }`}
                        >
                          {member.status || "-"}
                        </span>

                      </td>

                      <td>
                        {member.createdAt
                          ? new Date(
                              member.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ====================================
          RECENT ORDERS
      ==================================== */}

      <div className="tl-section">

        <div className="tl-section-header">

          <h2>
            Recent Orders
          </h2>

          <a href="/dashboard/team-leader/orders">
            View All
          </a>

        </div>


        {recentOrders.length === 0 ? (

          <div className="tl-empty">
            No orders found.
          </div>

        ) : (

          <div className="tl-table-wrapper">

            <table className="tl-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Buyer
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentOrders
                  .slice(0, 5)
                  .map((order) => (

                    <tr
                      key={order._id}
                    >

                      <td>
                        #
                        {order._id
                          ? order._id.slice(-8)
                          : "-"}
                      </td>


                      <td>
                        {order.buyer?.name ||
                          order.buyer?.email ||
                          "Member"}
                      </td>


                      <td>

                        <strong>
                          ₹
                          {Number(
                            order.totalAmount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </td>


                      <td>
                        {order.paymentStatus ||
                          "-"}
                      </td>


                      <td>

                        <span
                          className={`tl-status ${
                            String(
                              order.status || ""
                            ).toLowerCase()
                          }`}
                        >
                          {order.status || "-"}
                        </span>

                      </td>


                      <td>
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
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

export default TeamLeaderDashboard;
