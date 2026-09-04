import React, { useEffect, useState } from "react";
import "./cashManager.css";

const API = "http://localhost:5000/api";

function AdminTransferHistory() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadTransfers = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API}/cash/cash-manager/admin-transfers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load transfers"
        );
      }

      setTransfers(
        Array.isArray(data)
          ? data
          : data.transfers || data.transactions || data.data || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  if (loading) {
    return (
      <div className="cm-loading">
        Loading transfer history...
      </div>
    );
  }

  return (
    <div className="cm-page">
      <div className="cm-header">
        <div>
          <h1>Admin Transfer History</h1>
          <p>
            Cash Manager → Admin transfer records.
          </p>
        </div>

        <button
          className="cm-btn secondary"
          onClick={loadTransfers}
        >
          Refresh
        </button>
      </div>

      <div className="cm-table-wrapper">
        <table className="cm-table">
          <thead>
            <tr>
              <th>Admin</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Note</th>
              <th>Created</th>
              <th>Processed</th>
            </tr>
          </thead>

          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="cm-no-data"
                >
                  No Admin transfers found.
                </td>
              </tr>
            ) : (
              transfers.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.to?.name || "-"}
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
                    {item.note || "-"}
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {item.processedAt
                      ? new Date(
                          item.processedAt
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

export default AdminTransferHistory;