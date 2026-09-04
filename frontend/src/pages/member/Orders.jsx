import "./Orders.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/orders");

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date) {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  }

  function getPaymentClass(status) {
    switch (status) {
      case "APPROVED":
      case "PAID":
        return "status-badge approved";

      case "REJECTED":
      case "FAILED":
      case "REFUNDED":
        return "status-badge rejected";

      case "SUBMITTED":
        return "status-badge submitted";

      default:
        return "status-badge pending";
    }
  }

  function getOrderClass(status) {
    switch (status) {
      case "CONFIRMED":
        return "status-badge approved";

      case "CANCELLED":
        return "status-badge rejected";

      default:
        return "status-badge pending";
    }
  }

  function getPaymentLabel(status) {
    switch (status) {
      case "APPROVED":
        return "Paid";

      case "PAID":
        return "Paid";

      case "SUBMITTED":
        return "Submitted";

      case "REJECTED":
        return "Rejected";

      case "FAILED":
        return "Failed";

      case "REFUNDED":
        return "Refunded";

      case "PENDING":
      default:
        return "Pending";
    }
  }

  function getOrderLabel(status) {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed";

      case "CANCELLED":
        return "Cancelled";

      case "PENDING":
      default:
        return "Pending";
    }
  }

  function getOrderFilter(order) {
    if (order.status === "CONFIRMED") {
      return "CONFIRMED";
    }

    if (
      order.paymentStatus === "PENDING" ||
      order.paymentStatus === "SUBMITTED"
    ) {
      return "PENDING";
    }

    if (order.status === "CANCELLED") {
      return "CANCELLED";
    }

    return "OTHER";
  }

  const stats = useMemo(() => {
    const total = orders.length;

    const confirmed = orders.filter(
      (order) => order.status === "CONFIRMED"
    ).length;

    const pending = orders.filter(
      (order) =>
        order.paymentStatus === "PENDING" ||
        order.paymentStatus === "SUBMITTED"
    ).length;

    const cancelled = orders.filter(
      (order) => order.status === "CANCELLED"
    ).length;

    const totalPurchase = orders
      .filter((order) => order.status === "CONFIRMED")
      .reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
      );

    return {
      total,
      confirmed,
      pending,
      cancelled,
      totalPurchase,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orders;
    }

    return orders.filter(
      (order) => getOrderFilter(order) === filter
    );
  }, [orders, filter]);

  if (loading) {
    return (
      <div className="member-page orders-page">
        <div className="page-header orders-page-header">
          <div>
            <span className="page-eyebrow">MEMBER AREA</span>
            <h1>My Orders</h1>
            <p>
              View your products, payments and order status.
            </p>
          </div>
        </div>

        <div className="dashboard-card orders-loading">
          <div className="loading-spinner"></div>
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="member-page orders-page">
      {/* PAGE HEADER */}

      <div className="page-header orders-page-header">
        <div>
          <span className="page-eyebrow">MEMBER AREA</span>

          <h1>My Orders</h1>

          <p>
            Track your purchases, cash payment and order
            confirmation.
          </p>
        </div>

        <div className="orders-header-actions">
          <button
            className="secondary-button"
            onClick={loadOrders}
            type="button"
          >
            ↻ Refresh
          </button>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/dashboard/member/products")
            }
            type="button"
          >
            🛍️ Shop Products
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="network-message error-message">
          <span>⚠️</span>
          <div>
            <strong>Unable to load orders</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS */}

      {!error && (
        <div className="order-stats">
          <div className="dashboard-card order-stat-card">
            <div className="order-stat-icon">📦</div>

            <div>
              <small>Total Orders</small>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="dashboard-card order-stat-card">
            <div className="order-stat-icon">✓</div>

            <div>
              <small>Confirmed Orders</small>
              <strong>{stats.confirmed}</strong>
            </div>
          </div>

          <div className="dashboard-card order-stat-card">
            <div className="order-stat-icon">⏳</div>

            <div>
              <small>Pending Payments</small>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="dashboard-card order-stat-card">
            <div className="order-stat-icon">₹</div>

            <div>
              <small>Confirmed Purchase</small>
              <strong>₹{formatMoney(stats.totalPurchase)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS */}

      {!error && orders.length > 0 && (
        <div className="orders-toolbar">
          <div>
            <h2>Order History</h2>
            <p>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}{" "}
              shown
            </p>
          </div>

          <div className="order-filters">
            <button
              type="button"
              className={
                filter === "ALL"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setFilter("ALL")}
            >
              All
              <span>{orders.length}</span>
            </button>

            <button
              type="button"
              className={
                filter === "PENDING"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setFilter("PENDING")}
            >
              Pending
              <span>{stats.pending}</span>
            </button>

            <button
              type="button"
              className={
                filter === "CONFIRMED"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setFilter("CONFIRMED")}
            >
              Confirmed
              <span>{stats.confirmed}</span>
            </button>

            <button
              type="button"
              className={
                filter === "CANCELLED"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setFilter("CANCELLED")}
            >
              Cancelled
              <span>{stats.cancelled}</span>
            </button>
          </div>
        </div>
      )}

      {/* EMPTY */}

      {!error && orders.length === 0 && (
        <div className="dashboard-card empty-orders">
          <div className="empty-icon">📦</div>

          <h2>No Orders Yet</h2>

          <p>
            You have not purchased any products yet.
            Start shopping to place your first order.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/dashboard/member/products")
            }
            type="button"
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* FILTER EMPTY */}

      {!error &&
        orders.length > 0 &&
        filteredOrders.length === 0 && (
          <div className="dashboard-card empty-filter">
            <div className="empty-filter-icon">🔎</div>

            <h2>No matching orders</h2>

            <p>
              There are no orders in the selected category.
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setFilter("ALL")}
            >
              View All Orders
            </button>
          </div>
        )}

      {/* ORDERS */}

      {!error && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const buyer = order.buyer || {};
            const seller = order.seller || {};

            const productCount = Array.isArray(order.items)
              ? order.items.reduce(
                  (sum, item) =>
                    sum + Number(item.quantity || 0),
                  0
                )
              : 0;

            return (
              <div
                className="dashboard-card order-card"
                key={order._id}
              >
                {/* ORDER HEADER */}

                <div className="order-header">
                  <div className="order-heading">
                    <span className="order-label">
                      ORDER
                    </span>

                    <h2>
                      #
                      {order._id
                        ?.slice(-8)
                        .toUpperCase() || "ORDER"}
                    </h2>

                    <p>
                      Placed on{" "}
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="order-statuses">
                    <span
                      className={getPaymentClass(
                        order.paymentStatus
                      )}
                    >
                      Payment:{" "}
                      {getPaymentLabel(
                        order.paymentStatus
                      )}
                    </span>

                    <span
                      className={getOrderClass(
                        order.status
                      )}
                    >
                      Order:{" "}
                      {getOrderLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* ORDER SUMMARY */}

                <div className="order-summary-strip">
                  <div>
                    <span>Items</span>
                    <strong>{productCount}</strong>
                  </div>

                  <div>
                    <span>Amount</span>
                    <strong>
                      ₹{formatMoney(order.totalAmount)}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>
                    <strong>
                      {order.paymentMethod || "CASH"}
                    </strong>
                  </div>

                  <div>
                    <span>Date</span>
                    <strong>
                      {formatDate(order.createdAt)}
                    </strong>
                  </div>
                </div>

                {/* SELLER / ORDER INFO */}

                <div className="order-info-grid">
                  <div className="order-info-item">
                    <small>Team Leader</small>

                    <strong>
                      {seller.name ||
                        seller.fullName ||
                        "Team Leader"}
                    </strong>

                    {seller.mobile && (
                      <span>{seller.mobile}</span>
                    )}
                  </div>

                  <div className="order-info-item">
                    <small>Payment Method</small>

                    <strong>
                      {order.paymentMethod || "CASH"}
                    </strong>

                    <span>
                      Cash payment through Team Leader
                    </span>
                  </div>

                  <div className="order-info-item">
                    <small>Transaction ID</small>

                    <strong className="transaction-value">
                      {order.transactionId ||
                        "Not submitted"}
                    </strong>
                  </div>

                  <div className="order-info-item">
                    <small>Order Date</small>

                    <strong>
                      {formatDate(order.createdAt)}
                    </strong>
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="order-products">
                  <div className="section-heading">
                    <div>
                      <h3>Products</h3>
                      <span>
                        {productCount}{" "}
                        {productCount === 1
                          ? "item"
                          : "items"}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(order.items) &&
                  order.items.length > 0 ? (
                    <div className="order-products-list">
                      {order.items.map((item, index) => {
                        const product =
                          item.product || {};

                        const itemPrice = Number(
                          item.price || 0
                        );

                        const quantity = Number(
                          item.quantity || 0
                        );

                        const itemTotal =
                          itemPrice * quantity;

                        return (
                          <div
                            className="order-product"
                            key={
                              product._id ||
                              item._id ||
                              index
                            }
                          >
                            <div className="order-product-main">
                              <div className="product-placeholder">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={
                                      product.name ||
                                      "Product"
                                    }
                                    loading="lazy"
                                  />
                                ) : (
                                  <span>📦</span>
                                )}
                              </div>

                              <div className="order-product-details">
                                <strong>
                                  {product.name ||
                                    "Product"}
                                </strong>

                                <p>
                                  ₹{formatMoney(itemPrice)}
                                  <span> × </span>
                                  {quantity}
                                </p>
                              </div>
                            </div>

                            <strong className="product-total">
                              ₹{formatMoney(itemTotal)}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-product-details">
                      No product details available.
                    </div>
                  )}
                </div>

                {/* TOTAL */}

                <div className="order-footer">
                  <div className="order-total-label">
                    <span>Total Amount</span>

                    <small>
                      {productCount}{" "}
                      {productCount === 1
                        ? "item"
                        : "items"}
                    </small>
                  </div>

                  <strong>
                    ₹{formatMoney(order.totalAmount)}
                  </strong>
                </div>

                {/* PAYMENT / ORDER MESSAGE */}

                {order.paymentStatus === "PENDING" && (
                  <div className="order-alert pending-alert">
                    <span className="alert-icon">⏳</span>

                    <div>
                      <strong>Cash payment pending</strong>

                      <p>
                        Please pay the order amount to
                        your selected Team Leader. The
                        Team Leader will collect and
                        verify your cash payment.
                      </p>
                    </div>
                  </div>
                )}

                {order.paymentStatus === "SUBMITTED" && (
                  <div className="order-alert submitted-alert">
                    <span className="alert-icon">🔄</span>

                    <div>
                      <strong>
                        Cash collection submitted
                      </strong>

                      <p>
                        Your cash payment has been
                        submitted for verification.
                        Please wait for the Team Leader
                        to confirm the collection.
                      </p>
                    </div>
                  </div>
                )}

                {order.paymentStatus === "APPROVED" && (
                  <div className="order-alert approved-alert">
                    <span className="alert-icon">✓</span>

                    <div>
                      <strong>Payment approved</strong>

                      <p>
                        Your cash payment has been
                        collected and approved. Your
                        order can now be confirmed by
                        the Team Leader.
                      </p>
                    </div>
                  </div>
                )}

                {order.paymentStatus === "REJECTED" && (
                  <div className="order-alert rejected-alert">
                    <span className="alert-icon">✕</span>

                    <div>
                      <strong>Payment rejected</strong>

                      <p>
                        Your cash payment was rejected.
                        Please contact your Team Leader
                        for assistance.
                      </p>
                    </div>
                  </div>
                )}

                {order.paymentStatus === "PAID" &&
                  order.status !== "CONFIRMED" && (
                    <div className="order-alert approved-alert">
                      <span className="alert-icon">✓</span>

                      <div>
                        <strong>Payment received</strong>

                        <p>
                          Your payment has been received.
                          The Team Leader will confirm
                          your order.
                        </p>
                      </div>
                    </div>
                  )}

                {order.status === "CONFIRMED" && (
                  <div className="order-alert confirmed-order-alert">
                    <span className="alert-icon">🎉</span>

                    <div>
                      <strong>Order confirmed</strong>

                      <p>
                        Your order has been successfully
                        confirmed.
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "CANCELLED" && (
                  <div className="order-alert rejected-alert">
                    <span className="alert-icon">✕</span>

                    <div>
                      <strong>Order cancelled</strong>

                      <p>
                        This order has been cancelled.
                        Please contact support if you
                        need assistance.
                      </p>
                    </div>
                  </div>
                )}

                {/* MEMBER INFO */}

                {buyer.name && (
                  <div className="order-member-note">
                    <span>Member:</span>
                    <strong>{buyer.name}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;