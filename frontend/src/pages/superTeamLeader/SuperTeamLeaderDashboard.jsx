import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SuperTeamLeader.css";

const API = "http://localhost:5000/api";

function SuperTeamLeaderDashboard() {
  const [stock, setStock] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [stockRes, transactionRes] = await Promise.all([
        fetch(`${API}/stock/mine`, {
          headers: getHeaders(),
        }),

        fetch(`${API}/stock/transactions`, {
          headers: getHeaders(),
        }),
      ]);

      const stockData = await stockRes.json();
      const transactionData = await transactionRes.json();

      setStock(stockData.stock?.items || []);
      setTransactions(transactionData.transactions || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalStock = stock.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const lowStock = stock.filter(
    (item) =>
      Number(item.quantity || 0) <=
      Number(item.lowStockThreshold || 0)
  ).length;

  const stockValue = stock.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.product?.price || 0),
    0
  );

  if (loading) {
    return (
      <div className="stl-page">
        <div className="stl-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="stl-page">

      <div className="stl-header">
        <div>
          <h1>Super Team Leader Dashboard</h1>
          <p>Manage your network, stock and team leaders.</p>
        </div>

        <Link
          to="/dashboard/super-team-leader/profile"
          className="stl-profile-btn"
        >
          Profile
        </Link>
      </div>

      <div className="stl-cards">

        <div className="stl-card">
          <div className="stl-card-icon">📦</div>
          <div>
            <span>Total Products</span>
            <strong>{stock.length}</strong>
          </div>
        </div>

        <div className="stl-card">
          <div className="stl-card-icon">📊</div>
          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
          </div>
        </div>

        <div className="stl-card warning">
          <div className="stl-card-icon">⚠️</div>
          <div>
            <span>Low Stock</span>
            <strong>{lowStock}</strong>
          </div>
        </div>

        <div className="stl-card">
          <div className="stl-card-icon">💰</div>
          <div>
            <span>Stock Value</span>
            <strong>₹{stockValue.toLocaleString("en-IN")}</strong>
          </div>
        </div>

      </div>

      <div className="stl-grid">

        <div className="stl-panel">

          <div className="stl-panel-header">
            <h2>My Stock</h2>

            <Link
              to="/dashboard/super-team-leader/stock"
              className="stl-link"
            >
              View All
            </Link>
          </div>

          {stock.length === 0 ? (
            <div className="stl-empty">
              No stock available.
            </div>
          ) : (
            <div className="stl-table-wrapper">
              <table className="stl-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {stock.slice(0, 5).map((item, index) => {

                    const quantity = Number(item.quantity || 0);
                    const threshold = Number(
                      item.lowStockThreshold || 0
                    );

                    let status = "IN STOCK";

                    if (quantity === 0) {
                      status = "OUT OF STOCK";
                    } else if (quantity <= threshold) {
                      status = "LOW STOCK";
                    }

                    return (
                      <tr key={index}>
                        <td>{item.product?.name || "-"}</td>
                        <td>{item.product?.sku || "-"}</td>
                        <td>{quantity}</td>
                        <td>
                          <span
                            className={`stl-status ${status
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

        </div>

        <div className="stl-panel">

          <div className="stl-panel-header">
            <h2>Recent Transactions</h2>

            <Link
              to="/dashboard/super-team-leader/transactions"
              className="stl-link"
            >
              View All
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="stl-empty">
              No transactions found.
            </div>
          ) : (
            <div className="stl-transaction-list">

              {transactions.slice(0, 5).map((transaction) => {

                const received =
                  String(transaction.to?._id) ===
                  String(JSON.parse(localStorage.getItem("user"))?._id);

                return (
                  <div
                    className="stl-transaction"
                    key={transaction._id}
                  >
                    <div>
                      <strong>
                        {transaction.product?.name || "-"}
                      </strong>

                      <small>
                        {new Date(
                          transaction.createdAt
                        ).toLocaleString("en-IN")}
                      </small>
                    </div>

                    <span
                      className={
                        received
                          ? "stl-received"
                          : "stl-transferred"
                      }
                    >
                      {received ? "+" : "-"}
                      {transaction.quantity}
                    </span>
                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>

      <div className="stl-quick-grid">

        <Link
          to="/dashboard/super-team-leader/stock-distribution"
          className="stl-quick-card"
        >
          <span>📤</span>
          <strong>Transfer Stock</strong>
          <small>Send stock to Team Leaders</small>
        </Link>

        <Link
          to="/dashboard/super-team-leader/low-stock"
          className="stl-quick-card"
        >
          <span>⚠️</span>
          <strong>Low Stock</strong>
          <small>Check and manage limits</small>
        </Link>

        <Link
          to="/dashboard/super-team-leader/team-leaders"
          className="stl-quick-card"
        >
          <span>👥</span>
          <strong>Team Leaders</strong>
          <small>Manage your Team Leaders</small>
        </Link>

        <Link
          to="/dashboard/super-team-leader/transactions"
          className="stl-quick-card"
        >
          <span>📜</span>
          <strong>Transactions</strong>
          <small>View stock history</small>
        </Link>

      </div>

    </div>
  );
}

export default SuperTeamLeaderDashboard;