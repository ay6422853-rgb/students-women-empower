import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Orders.css";

const API =
  import.meta.env.VITE_API_URL ||
  "https://students-and-women-empower.onrender.com/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [processing, setProcessing] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const token =
    localStorage.getItem("token");

  // ======================================================
  // HEADERS
  // ======================================================

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // ======================================================
  // LOAD ORDERS
  // ======================================================

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error(
          "Login session not found"
        );
      }

      const response = await fetch(
        `${API}/orders`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load orders"
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (err) {
      console.error(
        "Load orders error:",
        err
      );

      setError(
        err.message ||
          "Unable to load orders"
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // ======================================================
  // ORDER ACTION
  // ======================================================

  async function updateOrder(
    orderId,
    action
  ) {
    const order =
      orders.find(
        (item) =>
          item._id === orderId
      );

    if (!order) {
      return;
    }

    // ====================================================
    // COLLECT CASH
    // ====================================================

    if (
      action === "collect-cash"
    ) {
      const amount =
        Number(order.total || 0);

      if (amount <= 0) {
        alert(
          "Invalid order amount."
        );
        return;
      }

      if (
        String(
          order.paymentStatus || ""
        ).toUpperCase() === "PAID"
      ) {
        alert(
          "Cash has already been collected for this order."
        );
        return;
      }

      const confirmed =
        window.confirm(
          `Collect cash of ₹${amount.toLocaleString(
            "en-IN"
          )} from ${
            order.buyer?.name ||
            "Member"
          }?`
        );

      if (!confirmed) {
        return;
      }
    }

    // ====================================================
    // CONFIRM ORDER
    // ====================================================

    if (action === "confirm") {
      const paymentStatus =
        String(
          order.paymentStatus ||
            ""
        ).toUpperCase();

      if (
        paymentStatus !== "PAID"
      ) {
        alert(
          "Cash must be collected before confirming this order."
        );

        return;
      }

      if (
        String(
          order.status || ""
        ).toUpperCase() ===
        "CONFIRMED"
      ) {
        alert(
          "Order is already confirmed."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to confirm this order?"
        );

      if (!confirmed) {
        return;
      }
    }

    // ====================================================
    // REQUEST
    // ====================================================

    try {
      setProcessing(
        `${orderId}-${action}`
      );

      setError("");

      const requestOptions = {
        method: "PATCH",
        headers: getHeaders(),
      };

      // ==================================================
      // COLLECT CASH
      // ==================================================

      if (
        action === "collect-cash"
      ) {
        requestOptions.body =
          JSON.stringify({
            amount: Number(
              order.total || 0
            ),
            note:
              "Cash collected from member",
          });
      }

      const response =
        await fetch(
          `${API}/orders/${orderId}/${action}`,
          requestOptions
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update order"
        );
      }

      // ==================================================
      // CASH COLLECTION SUCCESS
      // ==================================================

      if (
        action === "collect-cash"
      ) {
        const wallet =
          data.cashWallet;

        if (wallet) {
          console.log(
            "Team Leader Cash Wallet updated:",
            wallet
          );
        }

        alert(
          wallet
            ? `Cash collected successfully.\n\nAvailable Cash Balance: ₹${Number(
                wallet.availableBalance ||
                  0
              ).toLocaleString(
                "en-IN"
              )}`
            : "Cash collected successfully."
        );
      }

      // ==================================================
      // CONFIRM SUCCESS
      // ==================================================

      if (action === "confirm") {
        alert(
          "Order confirmed successfully."
        );
      }

      // ==================================================
      // RELOAD ORDERS
      // ==================================================

      await loadOrders();
    } catch (err) {
      console.error(
        "Update order error:",
        err
      );

      alert(
        err.message ||
          "Unable to update order"
      );
    } finally {
      setProcessing("");
    }
  }

  // ======================================================
  // SEARCH + FILTER
  // ======================================================

  const filteredOrders =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const status =
            String(
              order.status || ""
            ).toUpperCase();

          if (
            statusFilter !==
              "ALL" &&
            status !==
              statusFilter
          ) {
            return false;
          }

          if (!searchText) {
            return true;
          }

          const orderId =
            String(
              order._id || ""
            ).toLowerCase();

          const buyerName =
            String(
              order.buyer?.name ||
                ""
            ).toLowerCase();

          const buyerEmail =
            String(
              order.buyer?.email ||
                ""
            ).toLowerCase();

          const buyerPhone =
            String(
              order.buyer?.phone ||
                ""
            ).toLowerCase();

          const amount =
            String(
              order.total || ""
            ).toLowerCase();

          return (
            orderId.includes(
              searchText
            ) ||
            buyerName.includes(
              searchText
            ) ||
            buyerEmail.includes(
              searchText
            ) ||
            buyerPhone.includes(
              searchText
            ) ||
            amount.includes(
              searchText
            )
          );
        }
      );
    }, [
      orders,
      search,
      statusFilter,
    ]);

  // ======================================================
  // COUNTS
  // ======================================================

  const pendingCount =
    orders.filter(
      (order) =>
        String(
          order.status || ""
        ).toUpperCase() ===
        "PENDING"
    ).length;

  const confirmedCount =
    orders.filter(
      (order) =>
        String(
          order.status || ""
        ).toUpperCase() ===
        "CONFIRMED"
    ).length;

  const cancelledCount =
    orders.filter(
      (order) =>
        String(
          order.status || ""
        ).toUpperCase() ===
        "CANCELLED"
    ).length;

  const paidCount =
    orders.filter(
      (order) =>
        String(
          order.paymentStatus ||
            ""
        ).toUpperCase() ===
        "PAID"
    ).length;

  // ======================================================
  // TOTAL CASH COLLECTED
  // ======================================================

  const totalCashCollected =
    orders
      .filter(
        (order) =>
          String(
            order.paymentStatus ||
              ""
          ).toUpperCase() ===
          "PAID"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.total || 0
          ),
        0
      );

  // ======================================================
  // HELPERS
  // ======================================================

  const formatCurrency =
    (amount) => {
      return `₹${Number(
        amount || 0
      ).toLocaleString(
        "en-IN"
      )}`;
    };

  const formatDate =
    (date) => {
      if (!date) {
        return "-";
      }

      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

  const formatTime =
    (date) => {
      if (!date) {
        return "";
      }

      return new Date(
        date
      ).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="tl-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="tl-page-header">

        <div>
          <div className="tl-page-kicker">
            TEAM LEADER
          </div>

          <h1>
            Orders
          </h1>

          <p>
            Manage member orders,
            collect cash and confirm
            completed orders.
          </p>
        </div>

        <div className="tl-header-actions">

          <button
            type="button"
            className="tl-refresh-btn"
            onClick={
              loadOrders
            }
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "↻ Refresh"}
          </button>

          <div className="tl-count-badge">
            {
              filteredOrders.length
            }{" "}
            /{" "}
            {orders.length}{" "}
            Orders
          </div>

        </div>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="tl-error">

          <span>⚠</span>

          <div>
            <strong>
              Unable to load orders
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadOrders
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}

      {!loading &&
        !error && (
          <div className="tl-summary-grid">

            <div className="tl-summary-card">

              <div className="tl-summary-icon">
                #
              </div>

              <div>
                <span>
                  Total Orders
                </span>

                <strong>
                  {orders.length}
                </strong>
              </div>

            </div>

            <div className="tl-summary-card">

              <div className="tl-summary-icon">
                ⏳
              </div>

              <div>
                <span>
                  Pending Orders
                </span>

                <strong>
                  {pendingCount}
                </strong>
              </div>

            </div>

            <div className="tl-summary-card">

              <div className="tl-summary-icon">
                ✓
              </div>

              <div>
                <span>
                  Confirmed
                </span>

                <strong>
                  {confirmedCount}
                </strong>
              </div>

            </div>

            <div className="tl-summary-card">

              <div className="tl-summary-icon">
                ₹
              </div>

              <div>
                <span>
                  Cash Collected
                </span>

                <strong>
                  {formatCurrency(
                    totalCashCollected
                  )}
                </strong>

                <small>
                  {paidCount} paid
                </small>
              </div>

            </div>

          </div>
        )}

      {/* ==================================================
          SEARCH + FILTER
      ================================================== */}

      <div className="tl-section">

        <div className="tl-section-header">

          <div>
            <h2>
              Find Orders
            </h2>

            <p>
              Search by order ID,
              member, contact or
              amount.
            </p>
          </div>

        </div>

        <div className="tl-order-filters">

          <div className="tl-search-box">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search Order ID, member, email, phone or amount..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="tl-search-clear"
              >
                ×
              </button>
            )}

          </div>

          <select
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="tl-filter-select"
          >

            <option value="ALL">
              All Orders (
              {orders.length}
              )
            </option>

            <option value="PENDING">
              Pending (
              {pendingCount}
              )
            </option>

            <option value="CONFIRMED">
              Confirmed (
              {confirmedCount}
              )
            </option>

            <option value="CANCELLED">
              Cancelled (
              {cancelledCount}
              )
            </option>

          </select>

          {(search ||
            statusFilter !==
              "ALL") && (
            <button
              type="button"
              className="tl-btn secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter(
                  "ALL"
                );
              }}
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* ==================================================
          ORDERS
      ================================================== */}

      {loading ? (

        <div className="tl-loading-card">

          <div className="tl-spinner"></div>

          <strong>
            Loading orders...
          </strong>

          <span>
            Fetching orders from
            server.
          </span>

        </div>

      ) : filteredOrders.length ===
        0 ? (

        <div className="tl-empty-card">

          <div className="tl-empty-icon">
            #
          </div>

          <h2>
            {orders.length === 0
              ? "No Orders Yet"
              : "No Matching Orders"}
          </h2>

          <p>
            {orders.length === 0
              ? "Orders created by members will appear here."
              : "Try changing your search or status filter."}
          </p>

        </div>

      ) : (

        <div className="tl-table-card">

          <div className="tl-table-header">

            <div>
              <h2>
                Order Management
              </h2>

              <p>
                Collect cash first,
                then confirm the
                order.
              </p>
            </div>

            <div className="tl-table-count">
              {
                filteredOrders.length
              }{" "}
              {filteredOrders.length ===
              1
                ? "Order"
                : "Orders"}
            </div>

          </div>

          <div className="tl-table-wrapper">

            <table className="tl-table">

              <thead>

                <tr>
                  <th>
                    Order ID
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
                    Order Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredOrders.map(
                  (order) => {

                    const collectKey =
                      `${order._id}-collect-cash`;

                    const confirmKey =
                      `${order._id}-confirm`;

                    const isCollecting =
                      processing ===
                      collectKey;

                    const isConfirming =
                      processing ===
                      confirmKey;

                    const isConfirmed =
                      String(
                        order.status ||
                          ""
                      ).toUpperCase() ===
                      "CONFIRMED";

                    const isCancelled =
                      String(
                        order.status ||
                          ""
                      ).toUpperCase() ===
                      "CANCELLED";

                    const isPaid =
                      String(
                        order.paymentStatus ||
                          ""
                      ).toUpperCase() ===
                      "PAID";

                    return (
                      <tr
                        key={
                          order._id
                        }
                      >

                        {/* ORDER */}

                        <td>

                          <div className="tl-order-cell">

                            <strong>
                              #
                              {order._id?.slice(
                                -8
                              ) ||
                                "-"}
                            </strong>

                            <span>
                              Order
                            </span>

                          </div>

                        </td>

                        {/* BUYER */}

                        <td>

                          <div className="tl-member-cell">

                            <div className="tl-member-avatar">

                              {(
                                order
                                  .buyer
                                  ?.name ||
                                "M"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {order
                                  .buyer
                                  ?.name ||
                                  "Member"}
                              </strong>

                              {order
                                .buyer
                                ?.email && (
                                <small>
                                  {
                                    order
                                      .buyer
                                      .email
                                  }
                                </small>
                              )}

                              {order
                                .buyer
                                ?.phone && (
                                <small>
                                  {
                                    order
                                      .buyer
                                      .phone
                                  }
                                </small>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* AMOUNT */}

                        <td>

                          <strong className="tl-amount">
                            {formatCurrency(
                              order.total
                            )}
                          </strong>

                        </td>

                        {/* PAYMENT */}

                        <td>

                          <span
                            className={`tl-status ${String(
                              order.paymentStatus ||
                                "PENDING"
                            ).toLowerCase()}`}
                          >

                            <span className="tl-status-dot"></span>

                            {order.paymentStatus ||
                              "PENDING"}

                          </span>

                        </td>

                        {/* ORDER STATUS */}

                        <td>

                          <span
                            className={`tl-status ${String(
                              order.status ||
                                "UNKNOWN"
                            ).toLowerCase()}`}
                          >

                            <span className="tl-status-dot"></span>

                            {order.status ||
                              "UNKNOWN"}

                          </span>

                        </td>

                        {/* DATE */}

                        <td>

                          <div className="tl-date-cell">

                            <span>
                              {formatDate(
                                order.createdAt
                              )}
                            </span>

                            <small>
                              {formatTime(
                                order.createdAt
                              )}
                            </small>

                          </div>

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="tl-actions">

                            {!isConfirmed &&
                              !isCancelled && (
                                <>

                                  {/* COLLECT CASH */}

                                  {!isPaid && (
                                    <button
                                      type="button"
                                      className="tl-btn small"
                                      disabled={
                                        isCollecting ||
                                        isConfirming
                                      }
                                      onClick={() =>
                                        updateOrder(
                                          order._id,
                                          "collect-cash"
                                        )
                                      }
                                    >
                                      {isCollecting
                                        ? "Collecting..."
                                        : "Collect Cash"}
                                    </button>
                                  )}

                                  {/* CONFIRM */}

                                  <button
                                    type="button"
                                    className="tl-btn small success"
                                    disabled={
                                      !isPaid ||
                                      isCollecting ||
                                      isConfirming
                                    }
                                    title={
                                      !isPaid
                                        ? "Collect cash before confirming"
                                        : "Confirm order"
                                    }
                                    onClick={() =>
                                      updateOrder(
                                        order._id,
                                        "confirm"
                                      )
                                    }
                                  >
                                    {isConfirming
                                      ? "Confirming..."
                                      : "Confirm"}
                                  </button>

                                </>
                              )}

                            {isConfirmed && (
                              <span className="tl-success-text">
                                ✓ Confirmed
                              </span>
                            )}

                            {isCancelled && (
                              <span className="tl-cancelled-text">
                                Cancelled
                              </span>
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

export default Orders;
