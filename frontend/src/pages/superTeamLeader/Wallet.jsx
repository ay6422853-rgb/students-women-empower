
import "./SuperTeamLeader.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Wallet() {
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

  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD WALLET
  // ==========================================

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      setLoading(true);
      setError("");

      // Wallet balance
      const data = await api("/wallet");

      setWallet(
        data.wallet || {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0
        }
      );

      // Withdrawal history
      try {
        const withdrawalData =
          await api("/wallet/withdrawals");

        setWithdrawals(
          withdrawalData.withdrawals || []
        );
      } catch (withdrawalError) {
        console.error(
          "Withdrawal history error:",
          withdrawalError
        );
      }

    } catch (err) {
      console.error(
        "Wallet loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load wallet."
      );
    } finally {
      setLoading(false);
    }
  }


  // ==========================================
  // WITHDRAWAL
  // ==========================================

  async function submitWithdrawal(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const withdrawalAmount =
      Number(amount);

    if (
      !withdrawalAmount ||
      withdrawalAmount <= 0
    ) {
      setError(
        "Please enter a valid withdrawal amount."
      );
      return;
    }

    if (
      withdrawalAmount >
      Number(wallet.availableBalance || 0)
    ) {
      setError(
        "Insufficient available balance."
      );
      return;
    }

    if (!accountNumber.trim()) {
      setError(
        "Please enter your bank account number."
      );
      return;
    }

    if (!ifsc.trim()) {
      setError(
        "Please enter your IFSC code."
      );
      return;
    }

    try {
      setWithdrawing(true);

      const data = await api(
        "/wallet/withdraw",
        {
          method: "POST",

          body: JSON.stringify({
            amount: withdrawalAmount,

            bankDetails: {
              accountNumber:
                accountNumber.trim(),

              ifsc:
                ifsc.trim().toUpperCase()
            }
          })
        }
      );

      setMessage(
        data.message ||
        "Withdrawal request submitted successfully."
      );

      setAmount("");
      setAccountNumber("");
      setIfsc("");

      await loadWallet();

    } catch (err) {
      console.error(
        "Withdrawal error:",
        err
      );

      setError(
        err.message ||
        "Unable to submit withdrawal request."
      );
    } finally {
      setWithdrawing(false);
    }
  }


  // ==========================================
  // FORMAT MONEY
  // ==========================================

  function formatMoney(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }


  // ==========================================
  // FORMAT DATE
  // ==========================================

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


  // ==========================================
  // STATUS CLASS
  // ==========================================

  function getStatusClass(status) {
    switch (status) {
      case "PAID":
        return "status-badge approved";

      case "REJECTED":
        return "status-badge rejected";

      case "PENDING":
        return "status-badge pending";

      default:
        return "status-badge submitted";
    }
  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="stl-page">

        <div className="stl-header">

          <div>
            <h1>Wallet</h1>

            <p>
              Manage your earnings and withdrawals.
            </p>
          </div>

        </div>

        <div className="dashboard-card product-loading">
          Loading wallet...
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
            Wallet
          </h1>

          <p>
            Manage your earnings,
            available balance and withdrawals.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate(
              "/dashboard/super-team-leader/commission"
            )
          }
        >
          View Commission
        </button>

      </div>


      {/* =====================================
          MESSAGES
      ===================================== */}

      {error && (

        <div className="network-message error-message">
          {error}
        </div>

      )}

      {message && (

        <div className="network-message success-message">
          {message}
        </div>

      )}


      {/* =====================================
          BALANCE CARDS
      ===================================== */}

      <div className="order-stats">

        {/* AVAILABLE */}

        <div className="dashboard-card wallet-main-card">

          <small>
            Available Balance
          </small>

          <strong>
            ₹
            {formatMoney(
              wallet.availableBalance
            )}
          </strong>

          <span>
            Available for withdrawal
          </span>

        </div>


        {/* PENDING */}

        <div className="dashboard-card">

          <small>
            Pending Balance
          </small>

          <strong>
            ₹
            {formatMoney(
              wallet.pendingBalance
            )}
          </strong>

          <span>
            Waiting for approval
          </span>

        </div>


        {/* EARNINGS */}

        <div className="dashboard-card">

          <small>
            Total Earnings
          </small>

          <strong>
            ₹
            {formatMoney(
              wallet.totalEarnings
            )}
          </strong>

          <span>
            Lifetime earnings
          </span>

        </div>


        {/* WITHDRAWN */}

        <div className="dashboard-card">

          <small>
            Total Withdrawn
          </small>

          <strong>
            ₹
            {formatMoney(
              wallet.totalWithdrawn
            )}
          </strong>

          <span>
            Successfully withdrawn
          </span>

        </div>

      </div>


      {/* =====================================
          MAIN GRID
      ===================================== */}

      <div className="wallet-grid">

        {/* ===================================
            WITHDRAW MONEY
        =================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                Withdraw Money
              </h2>

              <p>
                Request a withdrawal from
                your available balance.
              </p>

            </div>

          </div>


          <form
            className="wallet-form"
            onSubmit={submitWithdrawal}
          >

            {/* AMOUNT */}

            <div className="form-group">

              <label>
                Withdrawal Amount *
              </label>

              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

              <small>
                Available: ₹
                {formatMoney(
                  wallet.availableBalance
                )}
              </small>

            </div>


            {/* ACCOUNT */}

            <div className="form-group">

              <label>
                Bank Account Number *
              </label>

              <input
                type="text"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(
                    e.target.value
                  )
                }
              />

            </div>


            {/* IFSC */}

            <div className="form-group">

              <label>
                IFSC Code *
              </label>

              <input
                type="text"
                placeholder="Example: SBIN0001234"
                value={ifsc}
                onChange={(e) =>
                  setIfsc(e.target.value)
                }
              />

            </div>


            {/* SUBMIT */}

            <button
              className="checkout-button"
              type="submit"
              disabled={
                withdrawing ||
                !wallet.availableBalance
              }
            >

              {withdrawing
                ? "Submitting..."
                : "Request Withdrawal"}

            </button>

          </form>

        </div>


        {/* ===================================
            WALLET INFORMATION
        =================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                Wallet Information
              </h2>

              <p>
                Understand your wallet balance.
              </p>

            </div>

          </div>


          <div className="wallet-info">

            <div className="wallet-info-row">

              <span>
                Available Balance
              </span>

              <strong>
                ₹
                {formatMoney(
                  wallet.availableBalance
                )}
              </strong>

            </div>


            <div className="wallet-info-row">

              <span>
                Pending Balance
              </span>

              <strong>
                ₹
                {formatMoney(
                  wallet.pendingBalance
                )}
              </strong>

            </div>


            <div className="wallet-info-row">

              <span>
                Total Earnings
              </span>

              <strong>
                ₹
                {formatMoney(
                  wallet.totalEarnings
                )}
              </strong>

            </div>


            <div className="wallet-info-row">

              <span>
                Total Withdrawn
              </span>

              <strong>
                ₹
                {formatMoney(
                  wallet.totalWithdrawn
                )}
              </strong>

            </div>

          </div>


          <div className="wallet-note">

            💡 Only your
            <strong> Available Balance </strong>
            can be withdrawn.

          </div>

        </div>

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
              Track your withdrawal requests.
            </p>

          </div>

        </div>


        {withdrawals.length === 0 ? (

          <div className="empty-network">

            <div className="empty-icon">
              💸
            </div>

            <h2>
              No Withdrawals Yet
            </h2>

            <p>
              Your withdrawal requests
              will appear here.
            </p>

          </div>

        ) : (

          <div className="withdrawal-list">

            {withdrawals.map(
              (withdrawal) => (

                <div
                  className="withdrawal-row"
                  key={withdrawal._id}
                >

                  {/* ICON */}

                  <div className="withdrawal-icon">
                    ₹
                  </div>


                  {/* DETAILS */}

                  <div className="withdrawal-details">

                    <strong>
                      Withdrawal Request
                    </strong>

                    <span>
                      {formatDate(
                        withdrawal.createdAt
                      )}
                    </span>

                    <span>
                      Account:{" "}
                      {withdrawal.bankDetails
                        ?.accountNumber
                        ? `****${String(
                            withdrawal
                              .bankDetails
                              .accountNumber
                          ).slice(-4)}`
                        : "Not available"}
                    </span>


                    {withdrawal.transactionId && (

                      <span>
                        Transaction:{" "}
                        {withdrawal.transactionId}
                      </span>

                    )}

                  </div>


                  {/* AMOUNT + STATUS */}

                  <div className="withdrawal-amount">

                    <strong>
                      ₹
                      {formatMoney(
                        withdrawal.amount
                      )}
                    </strong>

                    <span
                      className={getStatusClass(
                        withdrawal.status
                      )}
                    >
                      {withdrawal.status}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Wallet;

