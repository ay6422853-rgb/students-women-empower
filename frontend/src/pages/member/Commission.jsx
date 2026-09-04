import "./Commission.css"
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Commission() {
  const navigate = useNavigate();

  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCommissions();
  }, []);

  async function loadCommissions() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/commissions");

      setCommissions(data.commissions || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to load commissions."
      );
    } finally {
      setLoading(false);
    }
  }

  const totalCommission = useMemo(() => {
    return commissions.reduce(
      (total, commission) =>
        total + Number(commission.amount || 0),
      0
    );
  }, [commissions]);

  const pendingCommission = useMemo(() => {
    return commissions
      .filter(
        (commission) =>
          commission.status === "PENDING"
      )
      .reduce(
        (total, commission) =>
          total + Number(commission.amount || 0),
        0
      );
  }, [commissions]);

  const availableCommission = useMemo(() => {
    return commissions
      .filter(
        (commission) =>
          commission.status === "AVAILABLE"
      )
      .reduce(
        (total, commission) =>
          total + Number(commission.amount || 0),
        0
      );
  }, [commissions]);

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function statusClass(status) {
    if (status === "AVAILABLE") {
      return "status-badge approved";
    }

    return "status-badge pending";
  }

  function getSourceName(commission) {
    if (
      commission.sourceUser &&
      typeof commission.sourceUser === "object"
    ) {
      return (
        commission.sourceUser.name ||
        commission.sourceUser.email ||
        "User"
      );
    }

    return "Referral / Sale";
  }

  function getOrderId(commission) {
    if (
      commission.order &&
      typeof commission.order === "object"
    ) {
      return (
        commission.order._id ||
        "-"
      );
    }

    if (commission.order) {
      return commission.order;
    }

    return "-";
  }

  if (loading) {
    return (
      <div className="member-page">

        <div className="page-header">
          <div>
            <h1>Commission</h1>
            <p>
              Track your earnings from
              referrals and sales.
            </p>
          </div>
        </div>

        <div className="dashboard-card product-loading">
          Loading commissions...
        </div>

      </div>
    );
  }

  return (
    <div className="member-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>Commission</h1>

          <p>
            Track your commission earnings
            and available balance.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/dashboard/member/wallet")
          }
        >
          View Wallet
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="network-message error-message">
          {error}
        </div>
      )}


      {/* SUMMARY */}

      {!error && (

        <div className="order-stats">

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

          </div>


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

          </div>


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

          </div>

        </div>
      )}


      {/* EMPTY */}

      {!error &&
        commissions.length === 0 && (

        <div className="dashboard-card empty-network">

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

          <button
            className="checkout-button"
            onClick={() =>
              navigate("/dashboard/member/products")
            }
          >
            Explore Products
          </button>

        </div>

      )}


      {/* COMMISSION LIST */}

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
                  getOrderId(commission);

                return (
                  <div
                    className="commission-row"
                    key={commission._id}
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
                            ).slice(-8).toUpperCase()}`
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