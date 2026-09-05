import React, { useEffect, useMemo, useState } from "react";
import "./Orders.css";

const API = "https://students-and-women-empower.onrender.com/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");

  const [buyerRole, setBuyerRole] = useState("ALL");
  const [sellerRole, setSellerRole] = useState("ALL");

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // DATE TO DATE FILTER
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortBy, setSortBy] = useState("DATE_NEW");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // LOAD ORDERS
  // --------------------------------------------------

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(
        Array.isArray(data)
          ? data
          : data.orders || data.data || []
      );
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getBuyer = (order) =>
    order.buyer ||
    order.user ||
    order.customer ||
    {};

  const getSeller = (order) =>
    order.seller ||
    order.vendor ||
    {};

  const getBuyerName = (order) =>
    getBuyer(order)?.name ||
    getBuyer(order)?.fullName ||
    "-";

  const getSellerName = (order) =>
    getSeller(order)?.name ||
    getSeller(order)?.fullName ||
    "-";

  const getBuyerRole = (order) =>
    getBuyer(order)?.role || "-";

  const getSellerRole = (order) =>
    getSeller(order)?.role || "-";

  const getBuyerPhone = (order) =>
    getBuyer(order)?.phone ||
    getBuyer(order)?.mobile ||
    "-";

  const getSellerPhone = (order) =>
    getSeller(order)?.phone ||
    getSeller(order)?.mobile ||
    "-";

  const getAmount = (order) =>
    Number(
      order.totalAmount ??
        order.total ??
        order.amount ??
        order.grandTotal ??
        0
    );

  const getItemCount = (order) => {
    if (!Array.isArray(order.items)) return 0;

    return order.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity ||
            item.qty ||
            1
        ),
      0
    );
  };

  const getDate = (order) =>
    order.createdAt
      ? new Date(order.createdAt)
      : null;

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // --------------------------------------------------
  // FILTER + SORT
  // --------------------------------------------------

  const filtered = useMemo(() => {
    let result = [...orders];

    const q = search.trim().toLowerCase();

    // --------------------------------------------------
    // DATE TO DATE FILTER
    // --------------------------------------------------

    if (fromDate) {
      const startDate = new Date(
        `${fromDate}T00:00:00`
      );

      result = result.filter((order) => {
        const orderDate = getDate(order);

        return (
          orderDate &&
          orderDate >= startDate
        );
      });
    }

    if (toDate) {
      const endDate = new Date(
        `${toDate}T23:59:59.999`
      );

      result = result.filter((order) => {
        const orderDate = getDate(order);

        return (
          orderDate &&
          orderDate <= endDate
        );
      });
    }

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    if (q) {
      result = result.filter((order) => {
        const searchable = [
          order._id,
          order.orderNumber,
          order.orderId,

          getBuyerName(order),
          getBuyerPhone(order),
          getBuyerRole(order),

          getSellerName(order),
          getSellerPhone(order),
          getSellerRole(order),

          order.status,
          order.paymentStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(q);
      });
    }

    // --------------------------------------------------
    // ORDER STATUS
    // --------------------------------------------------

    if (status !== "ALL") {
      result = result.filter(
        (order) =>
          String(order.status || "").toUpperCase() ===
          status
      );
    }

    // --------------------------------------------------
    // PAYMENT STATUS
    // --------------------------------------------------

    if (paymentStatus !== "ALL") {
      result = result.filter(
        (order) =>
          String(
            order.paymentStatus || ""
          ).toUpperCase() === paymentStatus
      );
    }

    // --------------------------------------------------
    // BUYER ROLE
    // --------------------------------------------------

    if (buyerRole !== "ALL") {
      result = result.filter(
        (order) =>
          String(
            getBuyerRole(order)
          ).toUpperCase() === buyerRole
      );
    }

    // --------------------------------------------------
    // SELLER ROLE
    // --------------------------------------------------

    if (sellerRole !== "ALL") {
      result = result.filter(
        (order) =>
          String(
            getSellerRole(order)
          ).toUpperCase() === sellerRole
      );
    }

    // --------------------------------------------------
    // MINIMUM AMOUNT
    // --------------------------------------------------

    if (minAmount !== "") {
      result = result.filter(
        (order) =>
          getAmount(order) >=
          Number(minAmount)
      );
    }

    // --------------------------------------------------
    // MAXIMUM AMOUNT
    // --------------------------------------------------

    if (maxAmount !== "") {
      result = result.filter(
        (order) =>
          getAmount(order) <=
          Number(maxAmount)
      );
    }

    // --------------------------------------------------
    // SORTING
    // --------------------------------------------------

    result.sort((a, b) => {
      const amountA = getAmount(a);
      const amountB = getAmount(b);

      const itemsA = getItemCount(a);
      const itemsB = getItemCount(b);

      const dateA =
        getDate(a)?.getTime() || 0;

      const dateB =
        getDate(b)?.getTime() || 0;

      if (sortBy === "AMOUNT_HIGH") {
        return amountB - amountA;
      }

      if (sortBy === "AMOUNT_LOW") {
        return amountA - amountB;
      }

      if (sortBy === "ITEMS_HIGH") {
        return itemsB - itemsA;
      }

      if (sortBy === "ITEMS_LOW") {
        return itemsA - itemsB;
      }

      if (sortBy === "DATE_OLD") {
        return dateA - dateB;
      }

      if (sortBy === "DATE_NEW") {
        return dateB - dateA;
      }

      return 0;
    });

    return result;
  }, [
    orders,
    search,
    status,
    paymentStatus,
    buyerRole,
    sellerRole,
    minAmount,
    maxAmount,
    fromDate,
    toDate,
    sortBy,
  ]);

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const summary = useMemo(() => {
    const totalOrders = orders.length;

    const totalSales = orders.reduce(
      (sum, order) =>
        sum + getAmount(order),
      0
    );

    const pendingOrders = orders.filter(
      (order) =>
        String(order.status || "").toUpperCase() ===
        "PENDING"
    ).length;

    const confirmedOrders = orders.filter(
      (order) =>
        String(order.status || "").toUpperCase() ===
        "CONFIRMED"
    ).length;

    const cancelledOrders = orders.filter(
      (order) =>
        String(order.status || "").toUpperCase() ===
        "CANCELLED"
    ).length;

    const paidAmount = orders
      .filter((order) =>
        ["PAID", "APPROVED"].includes(
          String(
            order.paymentStatus || ""
          ).toUpperCase()
        )
      )
      .reduce(
        (sum, order) =>
          sum + getAmount(order),
        0
      );

    const pendingPayment = orders
      .filter(
        (order) =>
          String(
            order.paymentStatus || ""
          ).toUpperCase() === "PENDING"
      )
      .reduce(
        (sum, order) =>
          sum + getAmount(order),
        0
      );

    return {
      totalOrders,
      totalSales,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      paidAmount,
      pendingPayment,
    };
  }, [orders]);

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPaymentStatus("ALL");
    setBuyerRole("ALL");
    setSellerRole("ALL");
    setMinAmount("");
    setMaxAmount("");
    setFromDate("");
    setToDate("");
    setSortBy("DATE_NEW");
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="orders-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="orders-page">

      {/* HEADER */}

      <div className="orders-header">
        <div>
          <h1>Order Management</h1>
          <p>
            Monitor and analyse all platform
            orders.
          </p>
        </div>

        <button
          className="orders-btn secondary"
          onClick={loadOrders}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}

      <div className="orders-summary">

        <div className="orders-card">
          <span>Total Orders</span>
          <strong>
            {summary.totalOrders}
          </strong>
        </div>

        <div className="orders-card value">
          <span>Total Order Value</span>
          <strong>
            {money(summary.totalSales)}
          </strong>
        </div>

        <div className="orders-card success">
          <span>Confirmed Orders</span>
          <strong>
            {summary.confirmedOrders}
          </strong>
        </div>

        <div className="orders-card warning">
          <span>Pending Orders</span>
          <strong>
            {summary.pendingOrders}
          </strong>
        </div>

        <div className="orders-card danger">
          <span>Cancelled</span>
          <strong>
            {summary.cancelledOrders}
          </strong>
        </div>

        <div className="orders-card">
          <span>Paid Amount</span>
          <strong>
            {money(summary.paidAmount)}
          </strong>
        </div>

        <div className="orders-card warning">
          <span>Pending Payment</span>
          <strong>
            {money(summary.pendingPayment)}
          </strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="orders-filter-box">

        {/* DATE FROM */}

        <div className="orders-date-filter">
          <label>From Date</label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
          />
        </div>

        {/* DATE TO */}

        <div className="orders-date-filter">
          <label>To Date</label>

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
          />
        </div>

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search order, buyer, seller, phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* ORDER STATUS */}

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="ALL">
            All Order Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="CONFIRMED">
            Confirmed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>
        </select>

        {/* PAYMENT STATUS */}

        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(e.target.value)
          }
        >
          <option value="ALL">
            All Payment Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="PAID">
            Paid
          </option>

          <option value="APPROVED">
            Approved
          </option>

          <option value="REJECTED">
            Rejected
          </option>
        </select>

        {/* BUYER ROLE */}

        <select
          value={buyerRole}
          onChange={(e) =>
            setBuyerRole(e.target.value)
          }
        >
          <option value="ALL">
            All Buyer Roles
          </option>

          <option value="MEMBER">
            Member
          </option>

          <option value="TEAM_LEADER">
            Team Leader
          </option>

          <option value="SUPER_TEAM_LEADER">
            Super Team Leader
          </option>

          <option value="CHIEF_TEAM_OFFICER">
            Chief Team Officer
          </option>

          <option value="PRODUCT_MANAGER">
            Product Manager
          </option>

          <option value="CASH_MANAGER">
            Cash Manager
          </option>

          <option value="DISTRIBUTION_MANAGER">
            Distribution Manager
          </option>

          <option value="ADMIN">
            Admin
          </option>
        </select>

        {/* SELLER ROLE */}

        <select
          value={sellerRole}
          onChange={(e) =>
            setSellerRole(e.target.value)
          }
        >
          <option value="ALL">
            All Seller Roles
          </option>

          <option value="MEMBER">
            Member
          </option>

          <option value="TEAM_LEADER">
            Team Leader
          </option>

          <option value="SUPER_TEAM_LEADER">
            Super Team Leader
          </option>

          <option value="CHIEF_TEAM_OFFICER">
            Chief Team Officer
          </option>

          <option value="PRODUCT_MANAGER">
            Product Manager
          </option>

          <option value="DISTRIBUTION_MANAGER">
            Distribution Manager
          </option>

          <option value="ADMIN">
            Admin
          </option>
        </select>

        {/* MIN AMOUNT */}

        <input
          type="number"
          placeholder="Min ₹"
          value={minAmount}
          onChange={(e) =>
            setMinAmount(e.target.value)
          }
        />

        {/* MAX AMOUNT */}

        <input
          type="number"
          placeholder="Max ₹"
          value={maxAmount}
          onChange={(e) =>
            setMaxAmount(e.target.value)
          }
        />

        {/* SORT */}

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="DATE_NEW">
            Date: Newest
          </option>

          <option value="DATE_OLD">
            Date: Oldest
          </option>

          <option value="AMOUNT_HIGH">
            Order Value: High → Low
          </option>

          <option value="AMOUNT_LOW">
            Order Value: Low → High
          </option>

          <option value="ITEMS_HIGH">
            Items: High → Low
          </option>

          <option value="ITEMS_LOW">
            Items: Low → High
          </option>
        </select>

        {/* RESET */}

        <button
          className="orders-btn reset"
          onClick={resetFilters}
        >
          Reset
        </button>

      </div>

      {/* DATE RANGE INFO */}

      {(fromDate || toDate) && (
        <div className="orders-date-info">
          Showing orders from{" "}
          <strong>
            {fromDate || "Beginning"}
          </strong>{" "}
          to{" "}
          <strong>
            {toDate || "Today"}
          </strong>
        </div>
      )}

      {/* RESULT */}

      <div className="orders-result">
        Showing{" "}
        <strong>{filtered.length}</strong>{" "}
        of <strong>{orders.length}</strong>{" "}
        orders
      </div>

      {/* TABLE */}

      <div className="orders-table-wrapper">

        <table className="orders-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Buyer Role</th>
              <th>Seller</th>
              <th>Seller Role</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="12"
                  className="orders-empty"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map(
                (order, index) => (
                  <tr
                    key={
                      order._id ||
                      order.orderId ||
                      index
                    }
                  >

                    <td>{index + 1}</td>

                    <td>
                      <strong>
                        {order.orderNumber ||
                          order.orderId ||
                          (order._id
                            ? order._id.slice(-8)
                            : "-")}
                      </strong>
                    </td>

                    <td>
                      <div className="person-cell">
                        <strong>
                          {getBuyerName(order)}
                        </strong>

                        <small>
                          {getBuyerPhone(order)}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span className="role-badge">
                        {getBuyerRole(order)}
                      </span>
                    </td>

                    <td>
                      <div className="person-cell">
                        <strong>
                          {getSellerName(order)}
                        </strong>

                        <small>
                          {getSellerPhone(order)}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span className="role-badge">
                        {getSellerRole(order)}
                      </span>
                    </td>

                    <td>
                      {getItemCount(order)}
                    </td>

                    <td>
                      <strong>
                        {money(
                          getAmount(order)
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${String(
                          order.paymentStatus ||
                            ""
                        ).toLowerCase()}`}
                      >
                        {order.paymentStatus ||
                          "-"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${String(
                          order.status || ""
                        ).toLowerCase()}`}
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

                    <td>
                      <button
                        className="orders-btn small"
                        onClick={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {/* ORDER DETAILS */}

      {selectedOrder && (
        <div
          className="orders-modal-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="orders-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="orders-modal-header">

              <div>
                <h2>
                  Order Details
                </h2>

                <p>
                  Order ID:{" "}
                  {selectedOrder.orderNumber ||
                    selectedOrder.orderId ||
                    selectedOrder._id ||
                    "-"}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ×
              </button>

            </div>

            {/* BUYER / SELLER */}

            <div className="people-grid">

              <div className="person-card">
                <h3>Buyer</h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {getBuyerName(
                    selectedOrder
                  )}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {getBuyerPhone(
                    selectedOrder
                  )}
                </p>

                <p>
                  <strong>Role:</strong>{" "}
                  {getBuyerRole(
                    selectedOrder
                  )}
                </p>

              </div>

              <div className="person-card">
                <h3>Seller</h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {getSellerName(
                    selectedOrder
                  )}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {getSellerPhone(
                    selectedOrder
                  )}
                </p>

                <p>
                  <strong>Role:</strong>{" "}
                  {getSellerRole(
                    selectedOrder
                  )}
                </p>

              </div>

            </div>

            {/* ITEMS */}

            <h3 className="details-title">
              Order Items
            </h3>

            <div className="order-items">

              {Array.isArray(
                selectedOrder.items
              ) &&
              selectedOrder.items.length > 0 ? (
                selectedOrder.items.map(
                  (item, index) => {

                    const quantity =
                      Number(
                        item.quantity ||
                          item.qty ||
                          1
                      );

                    const price =
                      Number(
                        item.price ||
                          item.sellingPrice ||
                          item.product?.price ||
                          0
                      );

                    return (
                      <div
                        className="order-item"
                        key={
                          item._id ||
                          index
                        }
                      >

                        <div>
                          <strong>
                            {item.product?.name ||
                              item.productName ||
                              item.name ||
                              "Product"}
                          </strong>

                          <small>
                            SKU:{" "}
                            {item.product?.sku ||
                              item.sku ||
                              "-"}
                          </small>
                        </div>

                        <span>
                          Qty: {quantity}
                        </span>

                        <span>
                          {money(price)}
                        </span>

                        <strong>
                          {money(
                            price *
                              quantity
                          )}
                        </strong>

                      </div>
                    );
                  }
                )
              ) : (
                <div className="no-items">
                  No item details available.
                </div>
              )}

            </div>

            {/* TOTAL */}

            <div className="order-total">

              <span>
                Total Order Value
              </span>

              <strong>
                {money(
                  getAmount(
                    selectedOrder
                  )
                )}
              </strong>

            </div>

            {/* STATUS */}

            <div className="order-status-section">

              <div>
                <span>
                  Payment Status
                </span>

                <strong>
                  {selectedOrder.paymentStatus ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Order Status
                </span>

                <strong>
                  {selectedOrder.status ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Created
                </span>

                <strong>
                  {selectedOrder.createdAt
                    ? new Date(
                        selectedOrder.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "-"}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Orders;
