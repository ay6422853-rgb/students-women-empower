import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import "./Sales.css";

const API_URL =
  "https://students-and-women-empower.onrender.com/api/cto/sales";

function Sales() {
  const [data, setData] = useState(null);

  const [period, setPeriod] =
    useState("weekly");

  const [filter, setFilter] =
    useState("purchased");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD SALES
  // =====================================================

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login token nahi mila. Please login again."
        );
      }

      const response =
        await fetch(API_URL, {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          }
        });

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "Server JSON response nahi de raha. Backend route check karo."
        );
      }

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load sales"
        );
      }

      setData(result);

    } catch (err) {
      console.error(
        "Sales error:",
        err
      );

      setError(
        err.message ||
          "Unable to load sales"
      );

    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // CURRENT PERIOD DATA
  // =====================================================

  const currentData =
    data?.[period] || {
      totalOrders: 0,

      totalQuantity: 0,

      totalSales: 0,

      users: [],

      products: [],

      sellers: []
    };

  // =====================================================
  // PURCHASED USERS
  // =====================================================

  const purchasedUsers =
    useMemo(() => {
      return (
        currentData.users || []
      )
        .filter(
          (user) =>
            user.purchaseStatus ===
            "PURCHASED"
        )
        .sort(
          (a, b) =>
            Number(
              a.totalPurchase || 0
            ) -
            Number(
              b.totalPurchase || 0
            )
        );
    }, [currentData.users]);

  // =====================================================
  // NOT PURCHASED USERS
  // =====================================================

  const notPurchasedUsers =
    useMemo(() => {
      return (
        currentData.users || []
      )
        .filter(
          (user) =>
            user.purchaseStatus !==
            "PURCHASED"
        )
        .sort((a, b) =>
          String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            )
          )
        );
    }, [currentData.users]);

  // =====================================================
  // TOTAL CUSTOMERS
  // =====================================================

  const totalCustomers =
    purchasedUsers.length;

  // =====================================================
  // MONEY
  // =====================================================

  function money(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  // =====================================================
  // OPEN USER
  // =====================================================

  function openUser(user) {
    setSelectedUser(user);
  }

  // =====================================================
  // CLOSE USER
  // =====================================================

  function closeUser() {
    setSelectedUser(null);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="sales-page">

        <div className="sales-loading">

          <div className="sales-spinner"></div>

          <p>
            Loading Sales...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="sales-page">

        <div className="sales-error">

          <h2>
            Unable to Load Sales
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={loadSales}
            className="retry-btn"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="sales-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="sales-header">

        <div>

          <h1>
            Sales Management
          </h1>

          <p>
            Purchase activity aur customer
            shortlisting
          </p>

        </div>

        <button
          className="refresh-btn"
          onClick={loadSales}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =========================================
          PERIOD
      ========================================= */}

      <div className="period-tabs">

        <button
          className={
            period === "weekly"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("weekly")
          }
        >
          Weekly
        </button>

        <button
          className={
            period === "monthly"
              ? "active"
              : ""
          }
          onClick={() =>
            setPeriod("monthly")
          }
        >
          Monthly
        </button>

      </div>

      {/* =========================================
          SUMMARY
      ========================================= */}

      <div className="sales-summary">

        <div className="summary-card">

          <span>
            Total Orders
          </span>

          <strong>
            {currentData.totalOrders}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Total Products Sold
          </span>

          <strong>
            {currentData.totalQuantity}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Total Sales
          </span>

          <strong>
            {money(
              currentData.totalSales
            )}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Purchasing Users
          </span>

          <strong>
            {totalCustomers}
          </strong>

        </div>

      </div>

      {/* =========================================
          CUSTOMER SHORTLIST
      ========================================= */}

      <div className="shortlist-card">

        <div className="shortlist-header">

          <div>

            <h2>
              Customer Shortlisting
            </h2>

            <p>
              Sabse kam purchase karne
              wala user sabse upar
            </p>

          </div>

          <div className="shortlist-tabs">

            <button
              className={
                filter === "purchased"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("purchased")
              }
            >
              Purchased (
              {purchasedUsers.length}
              )
            </button>

            <button
              className={
                filter ===
                "not-purchased"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(
                  "not-purchased"
                )
              }
            >
              Not Purchased (
              {notPurchasedUsers.length}
              )
            </button>

          </div>

        </div>

        {/* =====================================
            PURCHASED USERS
        ===================================== */}

        {filter ===
          "purchased" && (

          <div className="table-wrapper">

            {purchasedUsers.length ===
            0 ? (

              <div className="empty-state">

                <h3>
                  No Purchase Found
                </h3>

                <p>
                  Is period me kisi
                  user ne purchase
                  nahi kiya.
                </p>

              </div>

            ) : (

              <table className="sales-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      User
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      City
                    </th>

                    <th>
                      Orders
                    </th>

                    <th>
                      Products
                    </th>

                    <th>
                      Total Purchase
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {purchasedUsers.map(
                    (
                      user,
                      index
                    ) => (

                      <tr
                        key={
                          user.userId
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">

                              {(
                                user.name ||
                                "U"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {user.name ||
                                  "Unknown"}
                              </strong>

                              <small>
                                {user.email ||
                                  "-"}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>
                          {user.phone ||
                            "-"}
                        </td>

                        <td>
                          {user.city ||
                            "-"}
                        </td>

                        <td>
                          {user.totalOrders ||
                            0}
                        </td>

                        <td>
                          {user.totalQuantity ||
                            0}
                        </td>

                        <td className="purchase-amount">

                          {money(
                            user.totalPurchase
                          )}

                        </td>

                        <td>

                          <button
                            className="view-btn"
                            onClick={() =>
                              openUser(
                                user
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

          </div>

        )}

        {/* =====================================
            NOT PURCHASED USERS
        ===================================== */}

        {filter ===
          "not-purchased" && (

          <div className="table-wrapper">

            {notPurchasedUsers.length ===
            0 ? (

              <div className="empty-state">

                <h3>
                  All Members Purchased
                </h3>

                <p>
                  Is period me sabhi
                  active members ne
                  purchase kiya hai.
                </p>

              </div>

            ) : (

              <table className="sales-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      User
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      City
                    </th>

                    <th>
                      State
                    </th>

                    <th>
                      Team Leader
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {notPurchasedUsers.map(
                    (
                      user,
                      index
                    ) => (

                      <tr
                        key={
                          user.userId
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">

                              {(
                                user.name ||
                                "U"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {user.name ||
                                  "Unknown"}
                              </strong>

                              <small>
                                {user.email ||
                                  "-"}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>
                          {user.phone ||
                            "-"}
                        </td>

                        <td>
                          {user.city ||
                            "-"}
                        </td>

                        <td>
                          {user.state ||
                            "-"}
                        </td>

                        <td>

                          {user.teamLeader
                            ?.name ||
                            "Not Assigned"}

                        </td>

                        <td>

                          <button
                            className="view-btn"
                            onClick={() =>
                              openUser(
                                user
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

          </div>

        )}

      </div>

      {/* =========================================
          PRODUCT SALES
      ========================================= */}

      <div className="section-card">

        <div className="section-title">

          <div>

            <h2>
              Product Sales
            </h2>

            <p>
              Sabse zyada bikne wale
              products
            </p>

          </div>

        </div>

        <div className="table-wrapper">

          <table className="sales-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  Product
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Sales
                </th>

              </tr>

            </thead>

            <tbody>

              {(currentData.products ||
                []).length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    style={{
                      textAlign:
                        "center"
                    }}
                  >
                    No product sales
                    found.
                  </td>

                </tr>

              ) : (

                (currentData.products ||
                  []).map(
                    (
                      product,
                      index
                    ) => (

                      <tr
                        key={
                          product.productId
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <strong>
                            {
                              product.productName
                            }
                          </strong>

                        </td>

                        <td>
                          {
                            product.quantity
                          }
                        </td>

                        <td className="purchase-amount">

                          {money(
                            product.sales
                          )}

                        </td>

                      </tr>

                    )
                  )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          SELLER PERFORMANCE
      ========================================= */}

      <div className="section-card">

        <div className="section-title">

          <div>

            <h2>
              Seller Performance
            </h2>

            <p>
              Team Leader wise sales
            </p>

          </div>

        </div>

        <div className="table-wrapper">

          <table className="sales-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  Seller
                </th>

                <th>
                  Role
                </th>

                <th>
                  Orders
                </th>

                <th>
                  Products
                </th>

                <th>
                  Total Sales
                </th>

              </tr>

            </thead>

            <tbody>

              {(currentData.sellers ||
                []).length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign:
                        "center"
                    }}
                  >
                    No seller sales
                    found.
                  </td>

                </tr>

              ) : (

                (currentData.sellers ||
                  []).map(
                    (
                      seller,
                      index
                    ) => (

                      <tr
                        key={
                          seller.sellerId
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="seller-info">

                            <strong>
                              {seller.name ||
                                "Unknown"}
                            </strong>

                            <small>
                              {seller.email ||
                                "-"}
                            </small>

                          </div>

                        </td>

                        <td>

                          <span className="role-badge">

                            {seller.role ||
                              "-"}

                          </span>

                        </td>

                        <td>
                          {
                            seller.totalOrders
                          }
                        </td>

                        <td>
                          {
                            seller.totalQuantity
                          }
                        </td>

                        <td className="purchase-amount">

                          {money(
                            seller.totalSales
                          )}

                        </td>

                      </tr>

                    )
                  )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          USER DETAILS MODAL
      ========================================= */}

      {selectedUser && (

        <div
          className="modal-overlay"
          onClick={closeUser}
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  Purchase Details
                </h2>

                <p>
                  Complete customer
                  information
                </p>

              </div>

              <button
                className="close-btn"
                onClick={closeUser}
              >
                ×
              </button>

            </div>

            {/* USER */}

            <div className="modal-user">

              <div className="large-avatar">

                {(
                  selectedUser.name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <h3>
                  {selectedUser.name ||
                    "Unknown"}
                </h3>

                <p>
                  {selectedUser.email ||
                    "-"}
                </p>

              </div>

            </div>

            {/* DETAILS */}

            <div className="details-grid">

              <div>

                <span>
                  Phone
                </span>

                <strong>
                  {selectedUser.phone ||
                    "-"}
                </strong>

              </div>

              <div>

                <span>
                  City
                </span>

                <strong>
                  {selectedUser.city ||
                    "-"}
                </strong>

              </div>

              <div>

                <span>
                  District
                </span>

                <strong>
                  {selectedUser.district ||
                    "-"}
                </strong>

              </div>

              <div>

                <span>
                  State
                </span>

                <strong>
                  {selectedUser.state ||
                    "-"}
                </strong>

              </div>

              <div className="full-detail">

                <span>
                  Address
                </span>

                <strong>
                  {selectedUser.address ||
                    "-"}
                </strong>

              </div>

              <div>

                <span>
                  Team Leader
                </span>

                <strong>
                  {selectedUser
                    .teamLeader
                    ?.name ||
                    "Not Assigned"}
                </strong>

              </div>

              <div>

                <span>
                  Purchase Status
                </span>

                <strong>
                  {selectedUser
                    .purchaseStatus ||
                    "NOT PURCHASED"}
                </strong>

              </div>

              <div>

                <span>
                  Total Orders
                </span>

                <strong>
                  {selectedUser
                    .totalOrders ||
                    0}
                </strong>

              </div>

              <div>

                <span>
                  Total Products
                </span>

                <strong>
                  {selectedUser
                    .totalQuantity ||
                    0}
                </strong>

              </div>

              <div className="highlight-detail">

                <span>
                  Total Purchase
                </span>

                <strong>
                  {money(
                    selectedUser
                      .totalPurchase
                  )}
                </strong>

              </div>

            </div>

            {/* =================================
                ORDERS
            ================================= */}

            {(
              selectedUser.orders ||
              []
            ).length > 0 && (

              <div
                style={{
                  marginTop:
                    "20px"
                }}
              >

                <h3>
                  Orders
                </h3>

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "10px"
                  }}
                >

                  {selectedUser.orders.map(
                    (
                      order
                    ) => (

                      <div
                        key={
                          order.orderId
                        }
                        style={{
                          padding:
                            "12px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "8px"
                        }}
                      >

                        <strong>
                          Order #
                          {String(
                            order.orderId
                          ).slice(
                            -6
                          )}
                        </strong>

                        <div>
                          Amount:
                          {" "}
                          {money(
                            order.totalAmount
                          )}
                        </div>

                        <div>
                          Products:
                          {" "}
                          {
                            order.quantity
                          }
                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

            <div className="modal-footer">

              <button
                className="close-modal-btn"
                onClick={closeUser}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Sales;
