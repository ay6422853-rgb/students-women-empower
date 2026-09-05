import { useEffect, useState } from "react";
import "./TeamLeaderFinance.css";

const API_URL = "https://students-and-women-empower.onrender.com/api";

function Withdraw() {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);

  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const [walletResponse, withdrawalResponse] =
        await Promise.all([
          fetch(`${API_URL}/wallet/`, { headers }),
          fetch(`${API_URL}/wallet/withdrawals`, { headers })
        ]);

      const walletData = await walletResponse.json();
      const withdrawalData =
        await withdrawalResponse.json();

      if (!walletResponse.ok) {
        throw new Error(
          walletData.message || "Unable to load wallet"
        );
      }

      if (!withdrawalResponse.ok) {
        throw new Error(
          withdrawalData.message ||
          "Unable to load withdrawals"
        );
      }

      setWallet(walletData.wallet);

      setWithdrawals(
        withdrawalData.withdrawals || []
      );

    } catch (error) {
      console.error("Withdraw page error:", error);

      setError(
        error.message ||
        "Unable to load withdrawal data"
      );

    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }

    if (
      wallet &&
      withdrawAmount > Number(wallet.availableBalance || 0)
    ) {
      setError("Withdrawal amount exceeds available balance");
      return;
    }

    if (!accountNumber || !ifsc) {
      setError("Bank account number and IFSC are required");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/wallet/withdraw`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: withdrawAmount,
            bankDetails: {
              accountNumber,
              ifsc,
              bankName,
              accountHolder
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Withdrawal request failed"
        );
      }

      setMessage(
        data.message ||
        "Withdrawal request submitted"
      );

      setAmount("");

      await loadData();

    } catch (error) {
      console.error("Withdrawal error:", error);

      setError(
        error.message ||
        "Unable to submit withdrawal"
      );

    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function statusClass(status) {
    return `withdraw-status ${
      status?.toLowerCase() || ""
    }`;
  }

  if (loading) {
    return (
      <div className="withdraw-page">
        <div className="withdraw-loading">
          Loading withdrawal page...
        </div>
      </div>
    );
  }

  return (
    <div className="withdraw-page">

      <div className="withdraw-header">
        <div>
          <h1>Withdraw</h1>
          <p>
            Request withdrawal from your available wallet balance.
          </p>
        </div>

        <div className="withdraw-balance">
          <span>Available</span>
          <strong>
            ₹{Number(wallet?.availableBalance || 0).toFixed(2)}
          </strong>
        </div>
      </div>

      {message && (
        <div className="withdraw-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="withdraw-error">
          {error}
        </div>
      )}

      <div className="withdraw-grid">

        {/* FORM */}

        <div className="withdraw-form-card">

          <h2>Withdrawal Request</h2>

          <p className="withdraw-form-description">
            Enter the amount and bank details where you want
            to receive your payment.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="withdraw-field">

              <label>
                Amount
              </label>

              <div className="amount-input">
                <span>₹</span>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="Enter amount"
                />
              </div>

            </div>

            <div className="withdraw-field">

              <label>
                Account Holder Name
              </label>

              <input
                type="text"
                value={accountHolder}
                onChange={(e) =>
                  setAccountHolder(e.target.value)
                }
                placeholder="Enter account holder name"
              />

            </div>

            <div className="withdraw-field">

              <label>
                Bank Name
              </label>

              <input
                type="text"
                value={bankName}
                onChange={(e) =>
                  setBankName(e.target.value)
                }
                placeholder="Enter bank name"
              />

            </div>

            <div className="withdraw-field">

              <label>
                Account Number
              </label>

              <input
                type="text"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value)
                }
                placeholder="Enter account number"
              />

            </div>

            <div className="withdraw-field">

              <label>
                IFSC Code
              </label>

              <input
                type="text"
                value={ifsc}
                onChange={(e) =>
                  setIfsc(e.target.value.toUpperCase())
                }
                placeholder="Enter IFSC code"
              />

            </div>

            <button
              type="submit"
              className="withdraw-submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Request Withdrawal"}
            </button>

          </form>

        </div>


        {/* INFO */}

        <div className="withdraw-side-card">

          <h3>Withdrawal Information</h3>

          <div className="withdraw-info-item">
            <b>Available Balance</b>
            <span>
              ₹{Number(
                wallet?.availableBalance || 0
              ).toFixed(2)}
            </span>
          </div>

          <div className="withdraw-info-item">
            <b>Pending Balance</b>
            <span>
              ₹{Number(
                wallet?.pendingBalance || 0
              ).toFixed(2)}
            </span>
          </div>

          <div className="withdraw-info-item">
            <b>Total Withdrawn</b>
            <span>
              ₹{Number(
                wallet?.totalWithdrawn || 0
              ).toFixed(2)}
            </span>
          </div>

          <div className="withdraw-warning">
            Your available balance is deducted when the
            withdrawal request is submitted.
          </div>

        </div>

      </div>


      {/* HISTORY */}

      <div className="withdraw-history-card">

        <div className="withdraw-history-header">

          <div>
            <h2>Withdrawal History</h2>
            <p>
              Track all your withdrawal requests.
            </p>
          </div>

          <button
            className="history-refresh"
            onClick={loadData}
          >
            ↻ Refresh
          </button>

        </div>

        {withdrawals.length === 0 ? (

          <div className="withdraw-empty">
            <div>↗</div>
            <h3>No Withdrawals</h3>
            <p>
              Your withdrawal requests will appear here.
            </p>
          </div>

        ) : (

          <div className="withdraw-table-wrapper">

            <table className="withdraw-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Bank Account</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {withdrawals.map(
                  (withdrawal, index) => (

                    <tr key={withdrawal._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td className="withdraw-amount">
                        ₹{Number(
                          withdrawal.amount || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {withdrawal.bankDetails
                          ?.accountNumber
                          ? `••••${withdrawal.bankDetails.accountNumber.slice(-4)}`
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={statusClass(
                            withdrawal.status
                          )}
                        >
                          {withdrawal.status || "PENDING"}
                        </span>
                      </td>

                      <td>
                        {withdrawal.transactionId || "-"}
                      </td>

                      <td>
                        {formatDate(
                          withdrawal.createdAt
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Withdraw;
