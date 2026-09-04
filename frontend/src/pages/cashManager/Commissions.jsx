import React, { useEffect, useMemo, useState } from "react";
import "./Commissions.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [cashWallet, setCashWallet] = useState(null);

  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const request = async (url, options = {}) => {
    const res = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    let data = {};

    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed (${res.status})`
      );
    }

    return data;
  };

  const extractList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    return (
      data.commissions ||
      data.transactions ||
      data.data ||
      []
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [commissionData, walletData] =
        await Promise.all([
          request("/commissions"),
          request("/cash/cash-manager/wallet"),
        ]);

      setCommissions(
        Array.isArray(extractList(commissionData))
          ? extractList(commissionData)
          : []
      );

      const wallet =
        walletData.wallet ||
        walletData.cashWallet ||
        walletData.data ||
        walletData;

      setCashWallet(wallet || null);
    } catch (error) {
      console.error(
        "Cash Manager commission loading error:",
        error
      );

      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const payCommission = async (commission) => {
    const amount = Number(commission.amount || 0);

    if (amount <= 0) {
      setMessage("Invalid commission amount.");
      return;
    }

    const availableCash = Number(
      cashWallet?.availableBalance || 0
    );

    if (availableCash < amount) {
      setMessage(
        `Insufficient Cash Manager balance. Available: ₹${availableCash.toLocaleString(
          "en-IN"
        )}`
      );
      return;
    }

    const beneficiaryName =
      commission.beneficiary?.name ||
      "beneficiary";

    const confirmed = window.confirm(
      `Pay ₹${amount.toLocaleString(
        "en-IN"
      )} commission to ${beneficiaryName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPayingId(commission._id);
      setMessage("");

      const result = await request(
        `/commissions/${commission._id}/pay`,
        {
          method: "PATCH",
        }
      );

      console.log(
        "Commission payment response:",
        result
      );

      setMessage(
        `Commission of ₹${amount.toLocaleString(
          "en-IN"
        )} paid successfully.`
      );

      await loadData();
    } catch (error) {
      console.error(
        "Commission payment error:",
        error
      );

      setMessage(error.message);
    } finally {
      setPayingId(null);
    }
  };

  const availableCommissions = useMemo(
    () =>
      commissions.filter(
        (item) =>
          String(item.status || "").toUpperCase() ===
          "AVAILABLE"
      ),
    [commissions]
  );

  const paidCommissions = useMemo(
    () =>
      commissions.filter(
        (item) =>
          String(item.status || "").toUpperCase() ===
          "PAID"
      ),
    [commissions]
  );

  const availableCommissionAmount =
    availableCommissions.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const paidCommissionAmount =
    paidCommissions.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const cashAvailable = Number(
    cashWallet?.availableBalance || 0
  );

  const cashPending = Number(
    cashWallet?.pendingBalance || 0
  );

  const totalReceived = Number(
    cashWallet?.totalReceived || 0
  );

  if (loading) {
    return (
      <div className="cm-page">
        <div className="cm-loading-card">
          <div className="cm-spinner"></div>

          <h3>
            Loading Cash Manager Finance...
          </h3>

          <p>
            Fetching Cash Wallet and commission data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page">

      {/* HEADER */}
      <div className="cm-header">
        <div className="cm-title-section">
          <div className="cm-title-icon">
            ₹
          </div>

          <div>
            <div className="cm-eyebrow">
              CASH MANAGER
            </div>

            <h1>
              Commission Payments
            </h1>

            <p>
              Pay available commissions directly
              from your Cash Manager Cash Wallet.
            </p>
          </div>
        </div>

        <button
          className="cm-refresh-btn"
          onClick={loadData}
          disabled={loading}
        >
          <span>↻</span>
          Refresh
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          className={`cm-message ${
            message
              .toLowerCase()
              .includes("success")
              ? "success"
              : "error"
          }`}
        >
          <span>
            {message
              .toLowerCase()
              .includes("success")
              ? "✓"
              : "!"}
          </span>

          {message}
        </div>
      )}

      {/* CASH WALLET */}
      <div className="cm-wallet-banner">

        <div className="cm-wallet-main">
          <div className="cm-wallet-icon">
            ₹
          </div>

          <div>
            <span>
              CASH MANAGER AVAILABLE CASH
            </span>

            <strong>
              ₹
              {cashAvailable.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              This amount is used for commission
              payments and Admin transfers.
            </small>
          </div>
        </div>

        <div className="cm-wallet-mini-grid">

          <div>
            <span>Pending</span>
            <strong>
              ₹
              {cashPending.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div>
            <span>Total Received</span>
            <strong>
              ₹
              {totalReceived.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="cm-stats">

        <div className="cm-stat-card">
          <span>
            Available Commissions
          </span>

          <strong>
            {availableCommissions.length}
          </strong>
        </div>

        <div className="cm-stat-card">
          <span>
            Commission Amount
          </span>

          <strong>
            ₹
            {availableCommissionAmount.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div className="cm-stat-card">
          <span>
            Paid Commissions
          </span>

          <strong>
            {paidCommissions.length}
          </strong>
        </div>

        <div className="cm-stat-card">
          <span>
            Total Paid
          </span>

          <strong>
            ₹
            {paidCommissionAmount.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

      </div>

      {/* COMMISSION TABLE */}
      <div className="cm-content-card">

        <div className="cm-card-header">

          <div>
            <h2>
              Commission Payment Queue
            </h2>

            <p>
              AVAILABLE commissions can be paid
              from Cash Manager Cash Wallet.
            </p>
          </div>

          <div className="cm-status-indicator">
            <span></span>
            Live
          </div>

        </div>

        {commissions.length === 0 ? (
          <div className="cm-empty">
            <div className="cm-empty-icon">
              ✓
            </div>

            <h3>
              No commissions found
            </h3>

            <p>
              There are currently no commission
              records available.
            </p>

            <button
              className="cm-refresh-btn"
              onClick={loadData}
            >
              <span>↻</span>
              Refresh
            </button>
          </div>
        ) : (
          <div className="cm-table-wrapper">

            <table className="cm-table">

              <thead>
                <tr>
                  <th>BENEFICIARY</th>
                  <th>SOURCE USER</th>
                  <th>ORDER</th>
                  <th>LEVEL</th>
                  <th>RATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {commissions.map((item) => {

                  const status =
                    String(
                      item.status || ""
                    ).toUpperCase();

                  const amount =
                    Number(item.amount || 0);

                  const isPaying =
                    payingId === item._id;

                  return (
                    <tr key={item._id}>

                      <td>
                        <div className="cm-user">
                          <div className="cm-avatar">
                            {(
                              item.beneficiary?.name ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="cm-user-info">
                            <strong>
                              {item.beneficiary?.name ||
                                "Unknown"}
                            </strong>

                            <small>
                              {item.beneficiary?.phone ||
                                item.beneficiary?.email ||
                                "Member"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {item.sourceUser?.name ||
                          "-"}
                      </td>

                      <td>
                        <span className="cm-order-id">
                          {item.order?._id
                            ? item.order._id.slice(-8)
                            : "-"}
                        </span>
                      </td>

                      <td>
                        <span className="cm-level">
                          L{item.level || "-"}
                        </span>
                      </td>

                      <td>
                        {item.rate || 0}%
                      </td>

                      <td>
                        <div className="cm-amount">
                          ₹
                          {amount.toLocaleString(
                            "en-IN"
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`cm-badge ${status.toLowerCase()}`}
                        >
                          <span></span>
                          {status}
                        </span>
                      </td>

                      <td>
                        {status === "AVAILABLE" ? (
                          <button
                            className="cm-btn approve"
                            disabled={isPaying}
                            onClick={() =>
                              payCommission(item)
                            }
                          >
                            {isPaying ? (
                              <>
                                <span className="cm-btn-spinner"></span>
                                Paying...
                              </>
                            ) : (
                              <>
                                <span>₹</span>
                                Pay Commission
                              </>
                            )}
                          </button>
                        ) : status === "PAID" ? (
                          <span className="cm-paid">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="cm-paid">
                            -
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>

          </div>
        )}
      </div>

      {/* FLOW */}
      <div className="cm-flow-card">

        <div className="cm-flow-title">
          <span>ⓘ</span>
          Commission Payment Flow
        </div>

        <div className="cm-flow">

          <div className="cm-flow-step">
            <div className="cm-flow-number">
              1
            </div>

            <div>
              <strong>
                Cash Manager Wallet
              </strong>

              <small>
                Approved cash available
              </small>
            </div>
          </div>

          <div className="cm-flow-line"></div>

          <div className="cm-flow-step active">
            <div className="cm-flow-number">
              2
            </div>

            <div>
              <strong>
                Commission Payment
              </strong>

              <small>
                Pay member commission
              </small>
            </div>
          </div>

          <div className="cm-flow-line"></div>

          <div className="cm-flow-step">
            <div className="cm-flow-number">
              3
            </div>

            <div>
              <strong>
                Remaining Cash
              </strong>

              <small>
                Available for Admin transfer
              </small>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Commissions;