import React, { useEffect, useMemo, useState } from "react";
import "./cashManager.css";

const API = "https://students-and-women-empower.onrender.com/api";

function CashTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const token = localStorage.getItem("token");

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API}/cash/cash-manager/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load transactions");
      }

      setTransactions(
        Array.isArray(data)
          ? data
          : data.transactions || data.data || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const searchText = search.toLowerCase();

      const fromName =
        item.from?.name?.toLowerCase() || "";

      const toName =
        item.to?.name?.toLowerCase() || "";

      const transactionType =
        item.type?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        fromName.includes(searchText) ||
        toName.includes(searchText) ||
        transactionType.includes(searchText);

      const matchesType =
        type === "ALL" || item.type === type;

      const matchesStatus =
        status === "ALL" || item.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, search, type, status]);

  if (loading) {
    return <div className="cm-loading">Loading transactions...</div>;
  }

  return (
    <div className="cm-page">
      <div className="cm-header">
        <div>
          <h1>Cash Transactions</h1>
          <p>Complete cash transaction history.</p>
        </div>
      </div>

      <div className="cm-filters">
        <input
          type="text"
          placeholder="Search user or transaction..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="MEMBER_TO_TEAM_LEADER">
            Member → Team Leader
          </option>
          <option value="TEAM_LEADER_TO_CASH_MANAGER">
            Team Leader → Cash Manager
          </option>
          <option value="CASH_MANAGER_TO_ADMIN">
            Cash Manager → Admin
          </option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <button
          className="cm-btn secondary"
          onClick={loadTransactions}
        >
          Refresh
        </button>
      </div>

      <div className="cm-table-wrapper">
        <table className="cm-table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="cm-no-data">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((item) => (
                <tr key={item._id}>
                  <td>{item.from?.name || "-"}</td>

                  <td>{item.to?.name || "-"}</td>

                  <td>
                    <span className="cm-type">
                      {item.type || "-"}
                    </span>
                  </td>

                  <td>
                    ₹{Number(item.amount || 0).toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={`cm-badge ${String(
                        item.status || ""
                      ).toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CashTransactions;
