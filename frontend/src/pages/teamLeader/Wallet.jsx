import { useEffect, useState } from "react";
import "./TeamLeaderFinance.css";

const API_URL = "http://localhost:5000/api";

function Wallet() {
  const [wallet, setWallet] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/wallet/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load wallet");
      }

      setWallet(
        data.wallet || {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0
        }
      );

    } catch (error) {
      console.error("Wallet error:", error);
      setError(error.message || "Unable to load wallet");
    } finally {
      setLoading(false);
    }
  }

  function money(value) {
    return Number(value || 0).toFixed(2);
  }

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="wallet-loading">
          Loading wallet...
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">

      <div className="wallet-header">
        <div>
          <h1>My Wallet</h1>
          <p>
            Manage your earnings and available balance.
          </p>
        </div>

        <button
          className="wallet-refresh"
          onClick={loadWallet}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="wallet-error">
          {error}
        </div>
      )}

      <div className="wallet-main-card">

        <div>
          <span>Available Balance</span>

          <h2>
            ₹{money(wallet.availableBalance)}
          </h2>

          <p>
            Amount available for withdrawal
          </p>
        </div>

        <div className="wallet-symbol">
          ₹
        </div>

      </div>

      <div className="wallet-stats">

        <div className="wallet-stat">
          <span>Pending Balance</span>
          <strong>
            ₹{money(wallet.pendingBalance)}
          </strong>
        </div>

        <div className="wallet-stat">
          <span>Total Earnings</span>
          <strong>
            ₹{money(wallet.totalEarnings)}
          </strong>
        </div>

        <div className="wallet-stat">
          <span>Total Withdrawn</span>
          <strong>
            ₹{money(wallet.totalWithdrawn)}
          </strong>
        </div>

      </div>

      <div className="wallet-info">

        <h3>How your wallet works</h3>

        <div className="wallet-steps">

          <div>
            <b>1</b>
            <span>
              Commission is generated after eligible sales.
            </span>
          </div>

          <div>
            <b>2</b>
            <span>
              Approved commission moves to available balance.
            </span>
          </div>

          <div>
            <b>3</b>
            <span>
              You can request withdrawal from available balance.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Wallet;