
import "./SuperTeamLeader.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Commission() {
  const navigate = useNavigate();

  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD COMMISSIONS
  // ==========================================

  useEffect(() => {
    loadCommissions();
  }, []);

  async function loadCommissions() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/commissions");

      setCommissions(
        data.commissions || []
      );

    } catch (err) {
      console.error(
        "Commission loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load commissions."
      );

    } finally {
      setLoading(false);
    }
  }


  // ==========================================
  // TOTAL COMMISSION
  // ==========================================

  const totalCommission = useMemo(() => {
    return commissions.reduce(
      (total, commission) =>
        total +
        Number(
          commission.amount || 0
        ),
      0
    );
  }, [commissions]);


  // ==========================================
  // PENDING COMMISSION
  // ==========================================

  const pendingCommission = useMemo(() => {
    return commissions
      .filter(
        (commission) =>
          commission.status === "PENDING"
      )
      .reduce(
        (total, commission) =>
          total +
          Number(
            commission.amount || 0
          ),
        0
      );
  }, [commissions]);


  // ==========================================
  // AVAILABLE COMMISSION
  // ==========================================

  const availableCommission = useMemo(() => {
    return commissions
      .filter(
        (commission) =>
          commission.status === "AVAILABLE"
      )
      .reduce(
        (total, commission) =>
          total +
          Number(
            commission.amount || 0
          ),
        0
      );
  }, [commissions]);


  // ==========================================
  // DATE
  // ==========================================

  function formatDate(date) {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }


  // ==========================================
  // STATUS
  // ==========================================

  function statusClass(status) {
    if (
      status === "AVAILABLE"
    ) {
      return "status-badge approved";
    }

    if (
      status === "REJECTED"
    ) {
      return "status-badge rejected";
    }

    return "status-badge pending";
  }


  // ==========================================
  // SOURCE USER
  // ==========================================

  function getSourceName(
    commission
  ) {

    if (
      commission.sourceUser &&
      typeof commission.sourceUser ===
        "object"
    ) {

      return (
        commission.sourceUser.name ||
        commission.sourceUser.email ||
        "User"
      );

    }

    return "Referral / Sale";
  }


  // ==========================================
  // ORDER ID
  // ==========================================

  function getOrderId(
    commission
  ) {

    if (
      commission.order &&
      typeof commission.order ===
        "object"
    ) {

      return (
        commission.order._id ||
        "-"
      );

    }

    if (
      commission.order
    ) {
      return commission.order;
    }

    return "-";
  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="stl-page">

        <div className="stl-header">

          <div>

            <h1>
              Commission
            </h1>

            <p>
              Track your earned commission
              and available balance.
            </p>

          </div>

        </div>


        <div className="dashboard-card product-loading">

          Loading commissions...

        </div>

      </div>
    );

  }


  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="stl-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="stl-header">

        <div>

          <h1>
            Commission
          </h1>

          <p>
            Track your commission earnings
            and available balance.
          </p>

        </div>


        <button
          className="secondary-button"
          onClick={() =>
            navigate(
              "/dashboard/super-team-leader/wallet"
            )
          }
        >
          View Wallet
        </button>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (

        <div className="network-message error-message">

          {error}

          <button
            onClick={loadCommissions}
            className="retry-button"
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================
          SUMMARY
      ===================================== */}

      {!error && (

        <div className="order-stats">

          {/* TOTAL */}

          <div className="dashboard-card">

            <small>
              Total Commission
            </small>

            <strong>
              ₹
              {totalCommission.toLocaleString(
                "en-IN"
              )}
            </strong>

            <span>
              Lifetime commission
            </span>

          </div>


          {/* PENDING */}

          <div className="dashboard-card">

            <small>
              Pending Commission
            </small>

            <strong>
              ₹
              {pendingCommission.toLocaleString(
                "en-IN"
              )}
            </strong>

            <span>
              Waiting for approval
            </span>

          </div>


          {/* AVAILABLE */}

          <div className="dashboard-card">

            <small>
              Available Commission
            </small>

            <strong>
              ₹
              {availableCommission.toLocaleString(
                "en-IN"
              )}
            </strong>

            <span>
              Available for wallet
            </span>

          </div>

        </div>

      )}


      {/* =====================================
          EMPTY
      ===================================== */}

      {!error &&
        commissions.length === 0 && (

        <div className="dashboard-card stl-empty-page">

          <div className="empty-icon">
            💰
          </div>

          <h2>
            No Commission Yet
          </h2>

          <p>
            Your commission earnings will
            appear here after eligible
            sales are completed.
          </p>

        </div>

      )}


      {/* =====================================
          COMMISSION HISTORY
      ===================================== */}

      {!error &&
        commissions.length > 0 && (

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                Commission History
              </h2>

              <p>
                {commissions.length} commission
                {commissions.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

          </div>


          <div className="commission-list">

            {commissions.map(
              (commission) => {

                const orderId =
                  getOrderId(
                    commission
                  );

                return (

                  <div
                    className="commission-row"
                    key={
                      commission._id
                    }
                  >

                    {/* ICON */}

                    <div className="commission-icon">
                      ₹
                    </div>


                    {/* DETAILS */}

                    <div className="commission-details">

                      <strong>
                        Commission Earned
                      </strong>

                      <span>
                        Source:{" "}
                        {getSourceName(
                          commission
                        )}
                      </span>

                      <span>
                        Order:{" "}

                        {orderId !== "-"
                          ? `#${String(
                              orderId
                            )
                              .slice(-8)
                              .toUpperCase()}`
                          : "-"}
                      </span>

                      <span>
                        {formatDate(
                          commission.createdAt
                        )}
                      </span>

                    </div>


                    {/* AMOUNT */}

                    <div className="commission-amount">

                      <strong>
                        +₹
                        {Number(
                          commission.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <span
                        className={statusClass(
                          commission.status
                        )}
                      >
                        {commission.status}
                      </span>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Commission;

