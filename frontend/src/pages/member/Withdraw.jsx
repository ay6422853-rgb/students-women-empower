import "./Withdraw.css";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Withdraw() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0
  });

  const [withdrawals, setWithdrawals] = useState([]);

  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadWithdrawData();
  }, []);

  async function loadWithdrawData() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [walletData, withdrawalData] = await Promise.all([
        api("/wallet"),
        api("/wallet/withdrawals")
      ]);

      setWallet(
        walletData.wallet || {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0
        }
      );

      setWithdrawals(
        withdrawalData.withdrawals || []
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to load wallet information"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (
      withdrawAmount >
      Number(wallet.availableBalance || 0)
    ) {
      setError("Insufficient available balance.");
      return;
    }

    if (!accountHolderName.trim()) {
      setError("Please enter account holder name.");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter bank account number.");
      return;
    }

    if (!ifsc.trim()) {
      setError("Please enter IFSC code.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await api("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: withdrawAmount,
          bankDetails: {
            accountHolderName:
              accountHolderName.trim(),
            accountNumber:
              accountNumber.trim(),
            ifsc:
              ifsc.trim().toUpperCase()
          }
        })
      });

      setMessage(
        data.message ||
        "Withdrawal request submitted successfully."
      );

      setAmount("");

      await loadWithdrawData();

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Withdrawal request failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusClass(status) {
    if (status === "PAID") {
      return "withdrawal-status paid";
    }

    if (status === "REJECTED") {
      return "withdrawal-status rejected";
    }

    return "withdrawal-status pending";
  }

  if (loading) {
    return (
      <div className="member-page">

        <div className="dashboard-card">
          <p>Loading withdrawal information...</p>
        </div>

      </div>
    );
  }

  return (
    <div className="member-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <h1>Withdraw</h1>

          <p>
            Withdraw your available Empower earnings.
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
          WALLET SUMMARY
      ===================================== */}

      <div className="network-summary">

        <div className="network-stat">

          <span className="network-stat-icon">
            💰
          </span>

          <div>
            <small>
              Available Balance
            </small>

            <strong>
              ₹
              {Number(
                wallet.availableBalance || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        <div className="network-stat">

          <span className="network-stat-icon">
            ⏳
          </span>

          <div>
            <small>
              Pending Balance
            </small>

            <strong>
              ₹
              {Number(
                wallet.pendingBalance || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        <div className="network-stat">

          <span className="network-stat-icon">
            📈
          </span>

          <div>
            <small>
              Total Earnings
            </small>

            <strong>
              ₹
              {Number(
                wallet.totalEarnings || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        <div className="network-stat">

          <span className="network-stat-icon">
            🏦
          </span>

          <div>
            <small>
              Total Withdrawn
            </small>

            <strong>
              ₹
              {Number(
                wallet.totalWithdrawn || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================
          SUCCESS / ERROR
      ===================================== */}

      {message && (
        <div className="network-message">
          {message}
        </div>
      )}

      {error && (
        <div className="network-message">
          {error}
        </div>
      )}


      {/* =====================================
          WITHDRAW FORM
      ===================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>
              Request Withdrawal
            </h2>

            <p>
              Enter your bank details and withdrawal amount.
            </p>
          </div>

        </div>


        <form
          className="form"
          onSubmit={handleWithdraw}
        >

          {/* AMOUNT */}

          <div className="form-group">

            <label>
              Withdrawal Amount
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />

            <small>
              Available: ₹
              {Number(
                wallet.availableBalance || 0
              ).toLocaleString("en-IN")}
            </small>

          </div>


          {/* ACCOUNT HOLDER */}

          <div className="form-group">

            <label>
              Account Holder Name
            </label>

            <input
              type="text"
              placeholder="Enter account holder name"
              value={accountHolderName}
              onChange={(e) =>
                setAccountHolderName(e.target.value)
              }
            />

          </div>


          {/* ACCOUNT NUMBER */}

          <div className="form-group">

            <label>
              Bank Account Number
            </label>

            <input
              type="text"
              placeholder="Enter bank account number"
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value)
              }
            />

          </div>


          {/* IFSC */}

          <div className="form-group">

            <label>
              IFSC Code
            </label>

            <input
              type="text"
              placeholder="Enter IFSC code"
              value={ifsc}
              onChange={(e) =>
                setIfsc(e.target.value.toUpperCase())
              }
            />

          </div>


          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Request Withdrawal"}
          </button>

        </form>

      </div>


      {/* =====================================
          WITHDRAWAL HISTORY
      ===================================== */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>
              Withdrawal History
            </h2>

            <p>
              Track your previous withdrawal requests.
            </p>
          </div>

        </div>


        {withdrawals.length === 0 ? (

          <div className="empty-network">

            <div className="empty-icon">
              🏦
            </div>

            <h2>
              No Withdrawals Yet
            </h2>

            <p>
              Your withdrawal requests will appear here.
            </p>

          </div>

        ) : (

          <div className="network-list">

            {withdrawals.map(
              (withdrawal, index) => (

              <div
                className="network-user"
                key={
                  withdrawal._id || index
                }
              >

                {/* AMOUNT */}

                <div className="network-avatar">
                  ₹
                </div>


                {/* INFORMATION */}

                <div className="network-user-info">

                  <strong>
                    ₹
                    {Number(
                      withdrawal.amount || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  <span>
                    {withdrawal.createdAt
                      ? new Date(
                          withdrawal.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </span>

                  <small>
                    {withdrawal.bankDetails
                      ?.accountNumber
                      ? `A/C ****${String(
                          withdrawal.bankDetails.accountNumber
                        ).slice(-4)}`
                      : "Bank details unavailable"}
                  </small>

                </div>


                {/* STATUS */}

                <div className="network-status">

                  <span
                    className={getStatusClass(
                      withdrawal.status
                    )}
                  >
                    {withdrawal.status || "PENDING"}
                  </span>

                  {withdrawal.transactionId && (

                    <small>
                      Transaction:{" "}
                      {withdrawal.transactionId}
                    </small>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Withdraw;
