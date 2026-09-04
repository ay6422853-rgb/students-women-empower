
import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import "./Performance.css";

const API_URL =
  "http://localhost:5000/api/cto/performance";


function Performance() {

  // =====================================================
  // STATE
  // =====================================================

  const [period, setPeriod] =
    useState("monthly");

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showGraph, setShowGraph] =
    useState(false);


  // =====================================================
  // LOAD PERFORMANCE
  // =====================================================

  useEffect(() => {

    loadPerformance();

  }, [period]);


  async function loadPerformance() {

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
        await fetch(
          `${API_URL}?period=${period}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            }
          }
        );


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
          "Server JSON response nahi de raha."
        );

      }


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Unable to load performance"
        );

      }


      setData(result);

    }

    catch (err) {

      console.error(
        "Performance error:",
        err
      );

      setError(
        err.message ||
        "Unable to load performance"
      );

    }

    finally {

      setLoading(false);

    }

  }


  // =====================================================
  // MONEY
  // =====================================================

  function money(value) {

    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;

  }


  // =====================================================
  // PERIOD LABEL
  // =====================================================

  function periodLabel() {

    if (period === "monthly")
      return "Monthly";

    if (period === "quarterly")
      return "Quarterly";

    if (period === "half-yearly")
      return "Half-Yearly";

    if (period === "yearly")
      return "Yearly";

    return "Monthly";

  }


  // =====================================================
  // DATA
  // =====================================================

  const topPerformers =
    data?.topPerformers || [];


  const lowPerformers =
    data?.lowPerformers || [];


  const performance =
    data?.performance || [];


  const summary =
    data?.summary || {

      totalUsers: 0,

      activePerformers: 0,

      totalOrders: 0,

      totalQuantity: 0,

      totalSales: 0

    };


  // =====================================================
  // MAX SALES FOR GRAPH
  // =====================================================

  const maxSales =
    useMemo(() => {

      if (
        performance.length === 0
      ) {

        return 1;

      }


      return Math.max(

        ...performance.map(
          user =>
            Number(
              user.totalSales || 0
            )
        ),

        1

      );

    }, [performance]);


  // =====================================================
  // MAX ORDERS FOR GRAPH
  // =====================================================

  const maxOrders =
    useMemo(() => {

      if (
        performance.length === 0
      ) {

        return 1;

      }


      return Math.max(

        ...performance.map(
          user =>
            Number(
              user.totalOrders || 0
            )
        ),

        1

      );

    }, [performance]);


  // =====================================================
  // MAX PRODUCTS FOR GRAPH
  // =====================================================

  const maxProducts =
    useMemo(() => {

      if (
        performance.length === 0
      ) {

        return 1;

      }


      return Math.max(

        ...performance.map(
          user =>
            Number(
              user.totalQuantity || 0
            )
        ),

        1

      );

    }, [performance]);


  // =====================================================
  // ROLE CLASS
  // =====================================================

  function roleClass(role) {

    if (
      role ===
      "TEAM_LEADER"
    ) {

      return "role-team-leader";

    }


    if (
      role ===
      "SUPER_TEAM_LEADER"
    ) {

      return "role-super-team-leader";

    }


    return "role-member";

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="performance-page">

        <div className="performance-loading">

          <div className="performance-spinner"></div>

          <p>
            Loading Performance...
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

      <div className="performance-page">

        <div className="performance-error">

          <div className="error-icon">
            !
          </div>

          <h2>
            Unable to Load Performance
          </h2>

          <p>
            {error}
          </p>

          <button
            className="retry-btn"
            onClick={loadPerformance}
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

    <div className="performance-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="performance-header">

        <div>

          <span className="page-label">
            CTO MANAGEMENT
          </span>

          <h1>
            Performance
          </h1>

          <p>
            Team performance aur sales
            performance monitor karein.
          </p>

        </div>


        <div className="header-actions">

          <button
            className="refresh-btn"
            onClick={loadPerformance}
          >
            ↻ Refresh
          </button>

          <button
            className="graph-btn"
            onClick={() =>
              setShowGraph(true)
            }
          >
            📊 View Graph
          </button>

        </div>

      </div>


      {/* =================================================
          PERIOD
      ================================================= */}

      <div className="period-section">

        <div>

          <h3>
            Performance Period
          </h3>

          <p>
            Kis duration ka performance
            dekhna hai?
          </p>

        </div>


        <div className="period-buttons">

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


          <button
            className={
              period === "quarterly"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("quarterly")
            }
          >
            Quarterly
          </button>


          <button
            className={
              period === "half-yearly"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("half-yearly")
            }
          >
            Half-Yearly
          </button>


          <button
            className={
              period === "yearly"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("yearly")
            }
          >
            Yearly
          </button>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="performance-summary">

        <div className="performance-summary-card">

          <span>
            Total Users
          </span>

          <strong>
            {summary.totalUsers}
          </strong>

        </div>


        <div className="performance-summary-card">

          <span>
            Active Performers
          </span>

          <strong>
            {summary.activePerformers}
          </strong>

        </div>


        <div className="performance-summary-card">

          <span>
            Total Orders
          </span>

          <strong>
            {summary.totalOrders}
          </strong>

        </div>


        <div className="performance-summary-card">

          <span>
            Products Sold
          </span>

          <strong>
            {summary.totalQuantity}
          </strong>

        </div>


        <div className="performance-summary-card sales-card">

          <span>
            Total Sales
          </span>

          <strong>
            {money(summary.totalSales)}
          </strong>

        </div>

      </div>


      {/* =================================================
          TOP PERFORMERS
      ================================================= */}

      <div className="performer-section top-section">

        <div className="section-heading">

          <div>

            <span className="section-label top-label">
              BEST PERFORMANCE
            </span>

            <h2>
              🏆 Top Performers
            </h2>

            <p>
              {periodLabel()} me sabse
              achha performance karne wale
              users.
            </p>

          </div>

        </div>


        {topPerformers.length === 0 ? (

          <div className="empty-performance">

            <h3>
              No Top Performer
            </h3>

            <p>
              Is period me abhi koi confirmed
              sales nahi hui.
            </p>

          </div>

        ) : (

          <div className="performer-grid">

            {topPerformers.map(
              (user, index) => (

                <div
                  className={
                    `performer-card top-performer rank-${index + 1}`
                  }
                  key={user.userId}
                >

                  <div className="rank-circle">

                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}`}

                  </div>


                  <div className="performer-avatar">

                    {(
                      user.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>


                  <div className="performer-info">

                    <h3>
                      {user.name ||
                        "Unknown"}
                    </h3>

                    <span
                      className={
                        `role-badge ${roleClass(user.role)}`
                      }
                    >
                      {user.role
                        ?.replaceAll(
                          "_",
                          " "
                        ) ||
                        "MEMBER"}
                    </span>

                  </div>


                  <div className="performer-stats">

                    <div>

                      <span>
                        Sales
                      </span>

                      <strong>
                        {money(
                          user.totalSales
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Orders
                      </span>

                      <strong>
                        {user.totalOrders}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Products
                      </span>

                      <strong>
                        {user.totalQuantity}
                      </strong>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =================================================
          LOW PERFORMERS
      ================================================= */}

      <div className="performer-section low-section">

        <div className="section-heading">

          <div>

            <span className="section-label low-label">
              NEEDS ATTENTION
            </span>

            <h2>
              ⚠️ Low Performers
            </h2>

            <p>
              {periodLabel()} me sabse kam
              sales karne wale active performers.
            </p>

          </div>

        </div>


        {lowPerformers.length === 0 ? (

          <div className="empty-performance">

            <h3>
              No Low Performer
            </h3>

            <p>
              Abhi koi performer available
              nahi hai.
            </p>

          </div>

        ) : (

          <div className="low-performer-list">

            {lowPerformers.map(
              (user, index) => (

                <div
                  className="low-performer-row"
                  key={user.userId}
                >

                  <div className="low-rank">
                    #{index + 1}
                  </div>


                  <div className="low-avatar">

                    {(
                      user.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>


                  <div className="low-user">

                    <strong>
                      {user.name ||
                        "Unknown"}
                    </strong>

                    <span>
                      {user.email ||
                        "-"}
                    </span>

                  </div>


                  <span
                    className={
                      `role-badge ${roleClass(user.role)}`
                    }
                  >
                    {user.role
                      ?.replaceAll(
                        "_",
                        " "
                      ) ||
                      "MEMBER"}
                  </span>


                  <div className="low-stat">

                    <span>
                      Orders
                    </span>

                    <strong>
                      {user.totalOrders}
                    </strong>

                  </div>


                  <div className="low-stat">

                    <span>
                      Products
                    </span>

                    <strong>
                      {user.totalQuantity}
                    </strong>

                  </div>


                  <div className="low-sales">

                    <span>
                      Sales
                    </span>

                    <strong>
                      {money(
                        user.totalSales
                      )}
                    </strong>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =================================================
          COMPLETE PERFORMANCE
      ================================================= */}

      <div className="performance-table-section">

        <div className="section-heading">

          <div>

            <span className="section-label">
              COMPLETE REPORT
            </span>

            <h2>
              Performance List
            </h2>

            <p>
              {periodLabel()} ki complete
              performance ranking.
            </p>

          </div>


          <div className="table-count">

            {performance.length}
            {" "}
            Users

          </div>

        </div>


        <div className="performance-table-wrapper">

          <table className="performance-table">

            <thead>

              <tr>

                <th>
                  Rank
                </th>

                <th>
                  User
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

                <th>
                  Avg Order
                </th>

              </tr>

            </thead>


            <tbody>

              {performance.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="table-empty"
                  >
                    No performance data found.
                  </td>

                </tr>

              ) : (

                performance.map(
                  (user) => (

                    <tr
                      key={user.userId}
                    >

                      <td>

                        <span
                          className={
                            user.rank <= 3
                              ? "top-rank"
                              : "normal-rank"
                          }
                        >
                          {user.rank <= 3
                            ? user.rank === 1
                              ? "🥇 1"
                              : user.rank === 2
                              ? "🥈 2"
                              : "🥉 3"
                            : `#${user.rank}`}
                        </span>

                      </td>


                      <td>

                        <div className="table-user">

                          <div className="table-avatar">

                            {(
                              user.name ||
                              "U"
                            )
                              .charAt(0)
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

                        <span
                          className={
                            `role-badge ${roleClass(user.role)}`
                          }
                        >
                          {user.role
                            ?.replaceAll(
                              "_",
                              " "
                            ) ||
                            "MEMBER"}
                        </span>

                      </td>


                      <td>
                        {user.totalOrders}
                      </td>


                      <td>
                        {user.totalQuantity}
                      </td>


                      <td className="table-sales">

                        {money(
                          user.totalSales
                        )}

                      </td>


                      <td>

                        {money(
                          user.averageOrderValue
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


      {/* =================================================
          GRAPH MODAL
      ================================================= */}

      {showGraph && (

        <div
          className="graph-overlay"
          onClick={() =>
            setShowGraph(false)
          }
        >

          <div
            className="graph-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="graph-header">

              <div>

                <span className="section-label">
                  PERFORMANCE ANALYTICS
                </span>

                <h2>
                  📊 {periodLabel()} Graph
                </h2>

                <p>
                  Sales, orders aur products
                  ka comparison.
                </p>

              </div>


              <button
                className="graph-close"
                onClick={() =>
                  setShowGraph(false)
                }
              >
                ×
              </button>

            </div>


            {/* =================================================
                GRAPH
            ================================================= */}

            <div className="graph-container">

              {performance.length === 0 ? (

                <div className="graph-empty">

                  <h3>
                    No Data
                  </h3>

                  <p>
                    Graph dikhane ke liye
                    performance data available nahi hai.
                  </p>

                </div>

              ) : (

                <div className="bar-chart">

                  {performance
                    .slice(0, 10)
                    .map(
                      (user) => {

                        const sales =
                          Number(
                            user.totalSales ||
                            0
                          );


                        const orders =
                          Number(
                            user.totalOrders ||
                            0
                          );


                        const products =
                          Number(
                            user.totalQuantity ||
                            0
                          );


                        const salesHeight =
                          (
                            sales /
                            maxSales
                          ) * 100;


                        const ordersHeight =
                          (
                            orders /
                            maxOrders
                          ) * 100;


                        const productsHeight =
                          (
                            products /
                            maxProducts
                          ) * 100;


                        return (

                          <div
                            className="chart-column"
                            key={
                              user.userId
                            }
                          >

                            <div className="bars">

                              <div
                                className="bar sales-bar"
                                style={{
                                  height:
                                    `${Math.max(
                                      salesHeight,
                                      sales > 0
                                        ? 5
                                        : 1
                                    )}%`
                                }}
                                title={
                                  `Sales: ${money(sales)}`
                                }
                              >

                                <span>
                                  {sales > 0
                                    ? money(
                                        sales
                                      )
                                    : ""}
                                </span>

                              </div>


                              <div
                                className="bar orders-bar"
                                style={{
                                  height:
                                    `${Math.max(
                                      ordersHeight,
                                      orders > 0
                                        ? 5
                                        : 1
                                    )}%`
                                }}
                                title={
                                  `Orders: ${orders}`
                                }
                              >

                                <span>
                                  {orders > 0
                                    ? orders
                                    : ""}
                                </span>

                              </div>


                              <div
                                className="bar products-bar"
                                style={{
                                  height:
                                    `${Math.max(
                                      productsHeight,
                                      products > 0
                                        ? 5
                                        : 1
                                    )}%`
                                }}
                                title={
                                  `Products: ${products}`
                                }
                              >

                                <span>
                                  {products > 0
                                    ? products
                                    : ""}
                                </span>

                              </div>

                            </div>


                            <div className="chart-name">

                              {user.name ||
                                "Unknown"}

                            </div>

                          </div>

                        );

                      }
                    )}

                </div>

              )}

            </div>


            {/* =================================================
                GRAPH LEGEND
            ================================================= */}

            <div className="graph-legend">

              <div>
                <span className="legend-box sales-legend"></span>
                Sales
              </div>

              <div>
                <span className="legend-box orders-legend"></span>
                Orders
              </div>

              <div>
                <span className="legend-box products-legend"></span>
                Products
              </div>

            </div>


            {/* =================================================
                GRAPH INFO
            ================================================= */}

            <div className="graph-info">

              <div>

                <span>
                  Period
                </span>

                <strong>
                  {periodLabel()}
                </strong>

              </div>


              <div>

                <span>
                  Total Sales
                </span>

                <strong>
                  {money(
                    summary.totalSales
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Total Orders
                </span>

                <strong>
                  {summary.totalOrders}
                </strong>

              </div>


              <div>

                <span>
                  Products Sold
                </span>

                <strong>
                  {summary.totalQuantity}
                </strong>

              </div>

            </div>


            <div className="graph-footer">

              <button
                className="close-graph-btn"
                onClick={() =>
                  setShowGraph(false)
                }
              >
                Close Graph
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default Performance;
