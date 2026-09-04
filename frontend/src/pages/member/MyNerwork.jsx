import "./MyNetwork.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function MyNetwork() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // weekly / monthly
  const [period, setPeriod] = useState("monthly");

  const navigate = useNavigate();

  useEffect(() => {
    fetchReferrals(period);
  }, [period]);

  async function fetchReferrals(selectedPeriod = period) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await api(
        `/users/my-referrals?period=${selectedPeriod}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReferrals(data.directReferrals || []);
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Unable to load your network"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredReferrals = useMemo(() => {
    return referrals.filter((user) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.phone?.includes(searchText) ||
        user.city?.toLowerCase().includes(searchText) ||
        user.district?.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" &&
          user.status === "ACTIVE") ||
        (filter === "PENDING" &&
          user.status === "PENDING") ||
        (filter === "PURCHASED" &&
          user.hasPurchased === true) ||
        (filter === "NO_PURCHASE" &&
          user.hasPurchased === false);

      return matchesSearch && matchesFilter;
    });
  }, [referrals, search, filter]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const activeMembers = referrals.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const pendingMembers = referrals.filter(
    (user) => user.status === "PENDING"
  ).length;

  const purchasedMembers = referrals.filter(
    (user) => user.hasPurchased === true
  ).length;

  const notPurchasedMembers = referrals.filter(
    (user) => user.hasPurchased !== true
  ).length;

  // Selected period का total network purchase
  const periodPurchase = referrals.reduce(
    (total, user) =>
      total + Number(user.totalPurchase || 0),
    0
  );

  return (
    <div className="member-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <h1>My Network</h1>

          <p>
            Track your referrals and their purchases
            during the selected period.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/dashboard/member")
          }
        >
          ← Dashboard
        </button>

      </div>


      {/* =====================================
          PERIOD SELECTOR
      ===================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>Purchase Period</h2>

            <p>
              View referral purchases for weekly or
              monthly period.
            </p>
          </div>

        </div>


        <div className="network-filters">

          <button
            className={
              period === "weekly"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </button>


          <button
            className={
              period === "monthly"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>

        </div>

      </div>


      {/* =====================================
          NETWORK SUMMARY
      ===================================== */}

      <div className="network-summary">

        <div className="network-stat">

          <span className="network-stat-icon">
            👥
          </span>

          <div>
            <small>
              Direct Referrals
            </small>

            <strong>
              {referrals.length}
            </strong>
          </div>

        </div>


        <div className="network-stat">

          <span className="network-stat-icon">
            🟢
          </span>

          <div>
            <small>
              Active Members
            </small>

            <strong>
              {activeMembers}
            </strong>
          </div>

        </div>


        <div className="network-stat">

          <span className="network-stat-icon">
            🛍️
          </span>

          <div>
            <small>
              Purchased ({period})
            </small>

            <strong>
              {purchasedMembers}
            </strong>
          </div>

        </div>


        <div className="network-stat">

          <span className="network-stat-icon">
            ❌
          </span>

          <div>
            <small>
              Not Purchased ({period})
            </small>

            <strong>
              {notPurchasedMembers}
            </strong>
          </div>

        </div>


        <div className="network-stat">

          <span className="network-stat-icon">
            💰
          </span>

          <div>
            <small>
              Network Purchase ({period})
            </small>

            <strong>
              ₹{periodPurchase.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {message && (

        <div className="network-message">

          {message}

          <button
            onClick={() => fetchReferrals(period)}
            className="retry-button"
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================
          LOADING
      ===================================== */}

      {loading && (

        <div className="dashboard-card network-loading">

          <div className="network-loader">
            Loading your network...
          </div>

        </div>

      )}


      {/* =====================================
          CONTENT
      ===================================== */}

      {!loading && !message && (

        <>

          {/* SEARCH + STATUS FILTER */}

          <div className="dashboard-card network-controls">

            <div className="network-search">

              <span>
                🔎
              </span>

              <input
                type="text"
                placeholder="Search by name, email, phone, city..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <div className="network-filters">

              <button
                className={
                  filter === "ALL"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("ALL")}
              >
                All
              </button>


              <button
                className={
                  filter === "ACTIVE"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("ACTIVE")}
              >
                Active
              </button>


              <button
                className={
                  filter === "PENDING"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter("PENDING")}
              >
                Pending
              </button>


              <button
                className={
                  filter === "PURCHASED"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setFilter("PURCHASED")
                }
              >
                Purchased
              </button>


              <button
                className={
                  filter === "NO_PURCHASE"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setFilter("NO_PURCHASE")
                }
              >
                No Purchase
              </button>

            </div>

          </div>


          {/* =================================
              NO REFERRALS
          ================================= */}

          {referrals.length === 0 && (

            <div className="dashboard-card empty-network">

              <div className="empty-icon">
                👥
              </div>

              <h2>
                No Direct Referrals Yet
              </h2>

              <p>
                You haven't referred any members yet.
                Share your referral code to start
                building your network.
              </p>

            </div>

          )}


          {/* =================================
              NO SEARCH RESULT
          ================================= */}

          {referrals.length > 0 &&
            filteredReferrals.length === 0 && (

            <div className="dashboard-card empty-network">

              <div className="empty-icon">
                🔎
              </div>

              <h2>
                No Members Found
              </h2>

              <p>
                No referral matches your current
                search or filter.
              </p>

              <button
                className="secondary-button"
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                }}
              >
                Clear Filter
              </button>

            </div>

          )}


          {/* =================================
              REFERRAL LIST
          ================================= */}

          {filteredReferrals.length > 0 && (

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h2>
                    Direct Referrals
                  </h2>

                  <p>
                    {period === "weekly"
                      ? "Purchase activity for the last 7 days."
                      : "Purchase activity for the current month."}
                  </p>

                </div>

              </div>


              <div className="network-list">

                {filteredReferrals.map(
                  (user, index) => (

                  <div
                    className="network-user"
                    key={
                      user._id || index
                    }
                  >

                    {/* AVATAR */}

                    <div className="network-avatar">

                      {user.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}

                    </div>


                    {/* BASIC INFORMATION */}

                    <div className="network-user-info">

                      <strong>
                        {user.name || "Unknown User"}
                      </strong>

                      <span>
                        {user.email ||
                          "Email not available"}
                      </span>

                      <small>
                        {user.phone ||
                          "Phone not available"}
                      </small>

                    </div>


                    {/* USER DETAILS */}

                    <div className="network-user-details">

                      <div>

                        <span>
                          Role
                        </span>

                        <strong>
                          {user.role
                            ?.replaceAll(
                              "_",
                              " "
                            ) || "-"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Location
                        </span>

                        <strong>
                          {user.city || "-"}
                          {user.state
                            ? `, ${user.state}`
                            : ""}
                        </strong>

                      </div>


                      {/* PERIOD PURCHASE */}

                      <div>

                        <span>
                          Purchase ({period})
                        </span>

                        <strong className="purchase-amount">

                          ₹
                          {Number(
                            user.totalPurchase || 0
                          ).toLocaleString("en-IN")}

                        </strong>

                      </div>


                      {/* PERIOD ORDERS */}

                      <div>

                        <span>
                          Orders ({period})
                        </span>

                        <strong>
                          {user.orderCount || 0}
                        </strong>

                      </div>

                    </div>


                    {/* STATUS */}

                    <div className="network-status">

                      <span
                        className={
                          user.status === "ACTIVE"
                            ? "user-status active"
                            : "user-status pending"
                        }
                      >
                        {user.status || "UNKNOWN"}
                      </span>


                      <span
                        className={
                          user.hasPurchased
                            ? "purchase-status purchased"
                            : "purchase-status not-purchased"
                        }
                      >
                        {user.hasPurchased
                          ? "PURCHASED"
                          : "NO PURCHASE"}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </>

      )}

    </div>
  );
}

export default MyNetwork;