import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./distributionManager.css";

const API_URL = "http://localhost:5000/api";

function DistributionManagerDashboard() {

  const [stock, setStock] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {

    try {

      setLoading(true);

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [stockRes, transactionRes] =
        await Promise.all([

          fetch(
            `${API_URL}/stock/mine`,
            { headers }
          ),

          fetch(
            `${API_URL}/stock/transactions`,
            { headers }
          )

        ]);

      const stockData =
        await stockRes.json();

      const transactionData =
        await transactionRes.json();

      setStock(
        stockData.stock?.items || []
      );

      setTransactions(
        transactionData.transactions || []
      );

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }

  const totalProducts =
    stock.length;

  const totalStock =
    stock.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const lowStock =
    stock.filter(
      item =>
        Number(item.quantity || 0) <=
        Number(item.lowStockThreshold || 0)
    ).length;

  const outOfStock =
    stock.filter(
      item =>
        Number(item.quantity || 0) === 0
    ).length;

  return (

    <div className="dm-page">

      {/* HEADER */}

      <div className="dm-page-header">

        <div>

          <h1>
            Distribution Manager Dashboard
          </h1>

          <p>
            Manage your stock, transfers and transactions
          </p>

        </div>

        <div className="dm-header-actions">

          <Link
            to="/dashboard/distribution-manager/transfer-stock"
            className="dm-primary-btn"
          >
            Transfer Stock
          </Link>

        </div>

      </div>


      {/* STATS */}

      <div className="dm-stat-grid">

        <div className="dm-stat-card">

          <div className="dm-stat-icon blue">
            📦
          </div>

          <div>
            <span>Total Products</span>
            <strong>
              {loading ? "..." : totalProducts}
            </strong>
          </div>

        </div>


        <div className="dm-stat-card">

          <div className="dm-stat-icon green">
            📊
          </div>

          <div>
            <span>Total Stock</span>
            <strong>
              {loading ? "..." : totalStock}
            </strong>
          </div>

        </div>


        <div className="dm-stat-card">

          <div className="dm-stat-icon orange">
            ⚠️
          </div>

          <div>
            <span>Low Stock</span>
            <strong>
              {loading ? "..." : lowStock}
            </strong>
          </div>

        </div>


        <div className="dm-stat-card">

          <div className="dm-stat-icon red">
            🚫
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>
              {loading ? "..." : outOfStock}
            </strong>
          </div>

        </div>

      </div>


      {/* CONTENT */}

      <div className="dm-dashboard-grid">

        {/* STOCK SUMMARY */}

        <div className="dm-card">

          <div className="dm-card-header">

            <div>

              <h2>
                Stock Summary
              </h2>

              <p>
                Current inventory
              </p>

            </div>

            <Link
              to="/dashboard/distribution-manager/stock"
              className="dm-link"
            >
              View All
            </Link>

          </div>


          <div className="dm-table-wrapper">

            <table className="dm-table">

              <thead>

                <tr>

                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {stock.length === 0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="dm-empty"
                    >
                      No stock available
                    </td>

                  </tr>

                ) : (

                  stock.slice(0, 5).map(
                    item => {

                      const quantity =
                        Number(
                          item.quantity || 0
                        );

                      const threshold =
                        Number(
                          item.lowStockThreshold || 0
                        );

                      let status =
                        "In Stock";

                      if (quantity === 0) {
                        status = "Out of Stock";
                      } else if (
                        quantity <= threshold
                      ) {
                        status = "Low Stock";
                      }

                      return (

                        <tr
                          key={item.product?._id}
                        >

                          <td>

                            <div className="dm-product-cell">

                              {item.product?.images?.[0] && (

                                <img
                                  src={
                                    item.product.images[0]
                                  }
                                  alt=""
                                />

                              )}

                              <span>
                                {item.product?.name ||
                                  "Unknown Product"}
                              </span>

                            </div>

                          </td>

                          <td>
                            {item.product?.sku || "-"}
                          </td>

                          <td>
                            {quantity}
                          </td>

                          <td>

                            <span
                              className={
                                `dm-status ${
                                  status === "In Stock"
                                    ? "success"
                                    : status === "Low Stock"
                                    ? "warning"
                                    : "danger"
                                }`
                              }
                            >
                              {status}
                            </span>

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* RECENT TRANSACTIONS */}

        <div className="dm-card">

          <div className="dm-card-header">

            <div>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Latest stock movement
              </p>

            </div>

            <Link
              to="/dashboard/distribution-manager/transactions"
              className="dm-link"
            >
              View All
            </Link>

          </div>


          <div className="dm-transaction-list">

            {transactions.length === 0 ? (

              <div className="dm-empty">
                No transactions found
              </div>

            ) : (

              transactions.slice(0, 6).map(
                transaction => {

                  const received =
                    String(
                      transaction.to?._id
                    ) ===
                    String(
                      JSON.parse(
                        localStorage.getItem("user")
                      )?._id
                    );

                  return (

                    <div
                      className="dm-transaction-item"
                      key={transaction._id}
                    >

                      <div
                        className={
                          `dm-transaction-icon ${
                            received
                              ? "received"
                              : "sent"
                          }`
                        }
                      >
                        {received ? "↓" : "↑"}
                      </div>

                      <div className="dm-transaction-info">

                        <strong>
                          {transaction.product?.name ||
                            "Product"}
                        </strong>

                        <span>
                          {transaction.type}
                        </span>

                      </div>

                      <div className="dm-transaction-qty">

                        <strong>
                          {received ? "+" : "-"}
                          {transaction.quantity}
                        </strong>

                        <small>
                          {new Date(
                            transaction.createdAt
                          ).toLocaleDateString()}
                        </small>

                      </div>

                    </div>

                  );

                }
              )

            )}

          </div>

        </div>

      </div>

    </div>

  );
}

export default DistributionManagerDashboard;