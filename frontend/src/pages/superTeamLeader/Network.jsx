
import "./SuperTeamLeader.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Network() {

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [period, setPeriod] = useState("monthly");

  const navigate = useNavigate();


  // ==========================================
  // LOAD MY DIRECT REFERRALS
  // ==========================================

  useEffect(() => {

    fetchNetwork(period);

  }, [period]);


  async function fetchNetwork(selectedPeriod = period) {

    const token =
      localStorage.getItem("token");


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

            Authorization:
              `Bearer ${token}`

          }

        }

      );


      console.log(
        "MY NETWORK RESPONSE:",
        data
      );


      setReferrals(
        data.directReferrals || []
      );


    } catch (error) {

      console.error(
        "Network error:",
        error
      );


      setMessage(

        error.message ||
        "Unable to load your network"

      );

    } finally {

      setLoading(false);

    }

  }


  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredReferrals =
    useMemo(() => {

      return referrals.filter(
        (user) => {

          const text =
            search
              .toLowerCase()
              .trim();


          const matchesSearch =

            !text ||

            user.name
              ?.toLowerCase()
              .includes(text) ||

            user.email
              ?.toLowerCase()
              .includes(text) ||

            user.phone
              ?.includes(text) ||

            user.city
              ?.toLowerCase()
              .includes(text) ||

            user.district
              ?.toLowerCase()
              .includes(text);


          const matchesFilter =

            filter === "ALL" ||

            (
              filter === "ACTIVE" &&
              user.status === "ACTIVE"
            ) ||

            (
              filter === "PENDING" &&
              user.status === "PENDING"
            ) ||

            (
              filter === "PURCHASED" &&
              user.hasPurchased === true
            ) ||

            (
              filter === "NO_PURCHASE" &&
              user.hasPurchased !== true
            );


          return (
            matchesSearch &&
            matchesFilter
          );

        }

      );

    }, [
      referrals,
      search,
      filter
    ]);


  // ==========================================
  // SUMMARY
  // ==========================================

  const activeMembers =
    referrals.filter(
      user =>
        user.status === "ACTIVE"
    ).length;


  const pendingMembers =
    referrals.filter(
      user =>
        user.status === "PENDING"
    ).length;


  const purchasedMembers =
    referrals.filter(
      user =>
        user.hasPurchased === true
    ).length;


  const notPurchasedMembers =
    referrals.filter(
      user =>
        user.hasPurchased !== true
    ).length;


  const periodPurchase =
    referrals.reduce(

      (total, user) =>

        total +
        Number(
          user.totalPurchase || 0
        ),

      0

    );


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="stl-page">

        <div className="stl-loading">

          Loading your network...

        </div>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="stl-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="stl-header">

        <div>

          <h1>
            My Network
          </h1>

          <p>
            View the members you directly referred
            and their purchase activity.
          </p>

        </div>


        <button
          className="stl-submit-btn"
          onClick={() =>
            fetchNetwork(period)
          }
        >
          Refresh
        </button>

      </div>


      {/* =====================================
          PERIOD
      ===================================== */}

      <div className="stl-panel">

        <div className="card-header">

          <div>

            <h2>
              Purchase Period
            </h2>

            <p>
              View referral purchases
              for the selected period.
            </p>

          </div>

        </div>


        <div className="stl-toolbar">

          <button
            className={
              period === "weekly"
                ? "filter-button active"
                : "filter-button"
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
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setPeriod("monthly")
            }
          >
            Monthly
          </button>

        </div>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {message && (

        <div className="stl-panel">

          <p>
            {message}
          </p>

          <button
            className="stl-submit-btn"
            onClick={() =>
              fetchNetwork(period)
            }
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================
          SUMMARY
      ===================================== */}

      {!message && (

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
                Active
              </small>

              <strong>
                {activeMembers}
              </strong>

            </div>

          </div>


          <div className="network-stat">

            <span className="network-stat-icon">
              ⏳
            </span>

            <div>

              <small>
                Pending
              </small>

              <strong>
                {pendingMembers}
              </strong>

            </div>

          </div>


          <div className="network-stat">

            <span className="network-stat-icon">
              🛍️
            </span>

            <div>

              <small>
                Purchased
              </small>

              <strong>
                {purchasedMembers}
              </strong>

            </div>

          </div>


          <div className="network-stat">

            <span className="network-stat-icon">
              💰
            </span>

            <div>

              <small>
                Network Purchase
              </small>

              <strong>
                ₹
                {periodPurchase.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          SEARCH + FILTER
      ===================================== */}

      {!message && (

        <div className="stl-panel">

          <div className="stl-toolbar">


            <input
              className="stl-search"
              placeholder="Search name, phone, email, city..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />


            <button
              className={
                filter === "ALL"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() =>
                setFilter("ALL")
              }
            >
              All
            </button>


            <button
              className={
                filter === "ACTIVE"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() =>
                setFilter("ACTIVE")
              }
            >
              Active
            </button>


            <button
              className={
                filter === "PENDING"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() =>
                setFilter("PENDING")
              }
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

      )}


      {/* =====================================
          NO REFERRALS
      ===================================== */}

      {!message &&
        referrals.length === 0 && (

        <div className="stl-panel">

          <h2>
            No Direct Referrals
          </h2>

          <p>
            You haven't referred any members yet.
          </p>

        </div>

      )}


      {/* =====================================
          NO SEARCH RESULT
      ===================================== */}

      {!message &&
        referrals.length > 0 &&
        filteredReferrals.length === 0 && (

        <div className="stl-panel">

          <h2>
            No Members Found
          </h2>

          <p>
            No member matches your search
            or selected filter.
          </p>

          <button
            className="stl-submit-btn"
            onClick={() => {

              setSearch("");

              setFilter("ALL");

            }}
          >
            Clear Filter
          </button>

        </div>

      )}


      {/* =====================================
          NETWORK LIST
      ===================================== */}

      {!message &&
        filteredReferrals.length > 0 && (

        <div className="stl-panel">


          <div className="stl-header">

            <div>

              <h2>
                Direct Referrals
              </h2>

              <p>
                {filteredReferrals.length}
                {" "}members found
              </p>

            </div>

          </div>


          <div className="stl-table-wrapper">

            <table className="stl-table">

              <thead>

                <tr>

                  <th>
                    Member
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Purchase
                  </th>

                  <th>
                    Orders
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredReferrals.map(
                  (user, index) => (

                  <tr
                    key={
                      user._id || index
                    }
                  >

                    <td>

                      <strong>
                        {user.name ||
                          "Unknown User"}
                      </strong>

                    </td>


                    <td>
                      {user.phone || "-"}
                    </td>


                    <td>
                      {user.email || "-"}
                    </td>


                    <td>
                      {user.role
                        ?.replaceAll(
                          "_",
                          " "
                        ) || "-"}
                    </td>


                    <td>

                      {user.city || "-"}

                      {user.state
                        ? `, ${user.state}`
                        : ""}

                    </td>


                    <td>

                      <span className="stl-status in-stock">

                        {user.status ||
                          "UNKNOWN"}

                      </span>

                    </td>


                    <td>

                      <strong>

                        ₹
                        {Number(
                          user.totalPurchase ||
                          0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </strong>

                    </td>


                    <td>

                      {user.orderCount || 0}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );

}

export default Network;

