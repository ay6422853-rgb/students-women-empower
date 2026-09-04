import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const API = "http://localhost:5000/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cashTransfers, setCashTransfers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const get = async (url) => {
    const res = await fetch(`${API}${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Request failed: ${res.status}`);
    }

    return data;
  };

  const arrayData = (data, keys = []) => {
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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        get("/admin/users"),
        get("/admin/products"),
        get("/admin/orders"),
        get("/admin/cash-transactions"),
      ]);

      /* =========================
         USERS
      ========================= */

      if (results[0].status === "fulfilled") {
        const userData = arrayData(
          results[0].value,
          ["users", "data"]
        );

        setUsers(userData);

        console.log("ADMIN USERS:", userData);
      } else {
        console.error(
          "Users API Error:",
          results[0].reason
        );
      }

      /* =========================
         PRODUCTS
      ========================= */

      if (results[1].status === "fulfilled") {
        const productData = arrayData(
          results[1].value,
          ["products", "data"]
        );

        setProducts(productData);

        console.log("ADMIN PRODUCTS:", productData);
      } else {
        console.error(
          "Products API Error:",
          results[1].reason
        );
      }

      /* =========================
         ORDERS
      ========================= */

      if (results[2].status === "fulfilled") {
        const orderData = arrayData(
          results[2].value,
          ["orders", "data"]
        );

        setOrders(orderData);

        console.log("ADMIN ORDERS:", orderData);
      } else {
        console.error(
          "Orders API Error:",
          results[2].reason
        );
      }

      /* =========================
         CASH TRANSACTIONS
      ========================= */

      if (results[3].status === "fulfilled") {
        const cashData = arrayData(
          results[3].value,
          [
            "transactions",
            "cashTransactions",
            "data",
          ]
        );

        setCashTransfers(cashData);

        console.log(
          "ADMIN CASH TRANSACTIONS:",
          cashData
        );
      } else {
        console.error(
          "Cash API Error:",
          results[3].reason
        );
      }

    } catch (error) {
      console.error("Dashboard Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     USER COUNTS
  ========================= */

  const members = users.filter(
    (u) => u.role === "MEMBER"
  ).length;

  const teamLeaders = users.filter(
    (u) => u.role === "TEAM_LEADER"
  ).length;

  const superTeamLeaders = users.filter(
    (u) => u.role === "SUPER_TEAM_LEADER"
  ).length;

  const cto = users.filter(
    (u) => u.role === "CHIEF_TEAM_OFFICER"
  ).length;

  const productManagers = users.filter(
    (u) => u.role === "PRODUCT_MANAGER"
  ).length;

  const cashManagers = users.filter(
    (u) => u.role === "CASH_MANAGER"
  ).length;

  const distributionManagers = users.filter(
    (u) => u.role === "DISTRIBUTION_MANAGER"
  ).length;

  /* =========================
     ORDER COUNTS
  ========================= */

  const pendingOrders = orders.filter(
    (o) =>
      o.status === "PENDING" ||
      o.paymentStatus === "PENDING"
  ).length;

  const confirmedOrders = orders.filter(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "COMPLETED"
  ).length;

  /* =========================
     CASH
  ========================= */

  const pendingCashAmount =
    cashTransfers.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-header">

        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Monitor and manage the Empower platform.
          </p>
        </div>

        <div className="admin-header-actions">

          <Link
            to="/dashboard/admin/portfolio"
            className="admin-btn"
          >
            📊 View Portfolio
          </Link>

          <button
            className="admin-btn secondary"
            onClick={loadDashboard}
          >
            🔄 Refresh
          </button>

        </div>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="admin-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* =========================
          MAIN STATISTICS
      ========================= */}

      <div className="admin-stats">

        <div className="admin-stat-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Members</span>
          <strong>{members}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Team Leaders</span>
          <strong>{teamLeaders}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Super Team Leaders</span>
          <strong>{superTeamLeaders}</strong>
        </div>

        <div className="admin-stat-card">
          <span>CTO</span>
          <strong>{cto}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Products</span>
          <strong>{products.length}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Pending Orders</span>
          <strong>{pendingOrders}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Confirmed Orders</span>
          <strong>{confirmedOrders}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Pending Cash</span>
          <strong>
            ₹{pendingCashAmount.toLocaleString("en-IN")}
          </strong>
        </div>

      </div>

      {/* =========================
          ROLE SUMMARY
      ========================= */}

      <div className="admin-section-title">
        <h2>Management Overview</h2>
      </div>

      <div className="admin-role-grid">

        <div className="admin-role-card">
          <span>Product Managers</span>
          <strong>{productManagers}</strong>
        </div>

        <div className="admin-role-card">
          <span>Cash Managers</span>
          <strong>{cashManagers}</strong>
        </div>

        <div className="admin-role-card">
          <span>Distribution Managers</span>
          <strong>{distributionManagers}</strong>
        </div>

      </div>

      {/* =========================
          QUICK MANAGEMENT
      ========================= */}

      <div className="admin-section-title">
        <h2>Quick Management</h2>
      </div>

      <div className="admin-action-grid">

        <Link to="/dashboard/admin/portfolio">
          <div className="admin-action-card portfolio-card">
            <h3>📊 Portfolio</h3>
            <p>
              View complete company portfolio,
              business performance and statistics.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/users">
          <div className="admin-action-card">
            <h3>👥 Users</h3>
            <p>
              View and manage all platform users.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/referral-network">
          <div className="admin-action-card">
            <h3>🌐 Referral Network</h3>
            <p>
              Monitor the complete referral structure.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/products">
          <div className="admin-action-card">
            <h3>📦 Products</h3>
            <p>
              Manage company products and categories.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/inventory">
          <div className="admin-action-card">
            <h3>🏭 Inventory</h3>
            <p>
              Monitor company and distributed stock.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/orders">
          <div className="admin-action-card">
            <h3>🛒 Orders</h3>
            <p>
              Monitor all platform orders.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/cash-transfers">
          <div className="admin-action-card">
            <h3>💵 Pending Cash Transfers</h3>
            <p>
              Approve or reject Cash Manager transfers.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/cash-transactions">
          <div className="admin-action-card">
            <h3>💳 Cash Transactions</h3>
            <p>
              View complete cash transaction history.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/commissions">
          <div className="admin-action-card">
            <h3>💰 Commissions</h3>
            <p>
              Monitor all commission records.
            </p>
          </div>
        </Link>

        <Link to="/dashboard/admin/admin-transfers">
          <div className="admin-action-card">
            <h3>🔄 Cash Manager Transfers</h3>
            <p>
              Manage transfers received from Cash Manager.
            </p>
          </div>
        </Link>

      </div>

    </div>
  );
}

export default AdminDashboard;