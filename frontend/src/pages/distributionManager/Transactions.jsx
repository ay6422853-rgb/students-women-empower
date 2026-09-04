import { useEffect, useState } from "react";
import "./distributionManager.css";

const API_URL = "http://localhost:5000/api";

function Transactions() {

  const [transactions, setTransactions] =
    useState([]);

  const [summary, setSummary] =
    useState({
      receivedQuantity: 0,
      transferredQuantity: 0,
      netMovement: 0
    });

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [type, setType] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");


  useEffect(() => {

    loadTransactions();

  }, []);


  async function loadTransactions() {

    try {

      setLoading(true);


      const params =
        new URLSearchParams();


      if (fromDate)
        params.append(
          "fromDate",
          fromDate
        );

      if (toDate)
        params.append(
          "toDate",
          toDate
        );

      if (type)
        params.append(
          "type",
          type
        );


      const response =
        await fetch(
          `${API_URL}/stock/transactions?${params.toString()}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      setTransactions(
        data.transactions || []
      );

      setSummary(
        data.summary || {
          receivedQuantity: 0,
          transferredQuantity: 0,
          netMovement: 0
        }
      );


    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }


  function clearFilters() {

    setFromDate("");
    setToDate("");
    setType("");

    setTimeout(
      loadTransactions,
      0
    );

  }


  return (

    <div className="dm-page">

      <div className="dm-page-header">

        <div>

          <h1>
            Transactions
          </h1>

          <p>
            Complete stock movement history
          </p>

        </div>

      </div>


      {/* SUMMARY */}

      <div className="dm-stat-grid">

        <div className="dm-stat-card">

          <div className="dm-stat-icon green">
            ↓
          </div>

          <div>

            <span>
              Received
            </span>

            <strong>
              {summary.receivedQuantity}
            </strong>

          </div>

        </div>


        <div className="dm-stat-card">

          <div className="dm-stat-icon orange">
            ↑
          </div>

          <div>

            <span>
              Transferred
            </span>

            <strong>
              {summary.transferredQuantity}
            </strong>

          </div>

        </div>


        <div className="dm-stat-card">

          <div className="dm-stat-icon blue">
            ↕
          </div>

          <div>

            <span>
              Net Movement
            </span>

            <strong>
              {summary.netMovement}
            </strong>

          </div>

        </div>

      </div>


      {/* FILTER */}

      <div className="dm-card">

        <div className="dm-filter-grid">

          <div className="dm-form-group">

            <label>
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={e =>
                setFromDate(
                  e.target.value
                )
              }
            />

          </div>


          <div className="dm-form-group">

            <label>
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={e =>
                setToDate(
                  e.target.value
                )
              }
            />

          </div>


          <div className="dm-form-group">

            <label>
              Transaction Type
            </label>

            <select
              value={type}
              onChange={e =>
                setType(
                  e.target.value
                )
              }
            >

              <option value="">
                All Transactions
              </option>

              <option value="COMPANY_TO_DISTRIBUTOR">
                Company → Distributor
              </option>

              <option value="DISTRIBUTOR_TO_SUPER_TEAM_LEADER">
                Distributor → Super Team Leader
              </option>

            </select>

          </div>


          <div className="dm-filter-actions">

            <button
              className="dm-primary-btn"
              onClick={loadTransactions}
            >
              Apply
            </button>

            <button
              className="dm-secondary-btn"
              onClick={clearFilters}
            >
              Clear
            </button>

          </div>

        </div>

      </div>


      {/* TABLE */}

      <div className="dm-card">

        <div className="dm-table-wrapper">

          <table className="dm-table">

            <thead>

              <tr>

                <th>Date / Time</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Quantity</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="dm-empty"
                  >
                    Loading transactions...
                  </td>

                </tr>

              ) : transactions.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="dm-empty"
                  >
                    No transactions found
                  </td>

                </tr>

              ) : (

                transactions.map(
                  transaction => {

                    const typeLabel =
                      transaction.type ===
                      "COMPANY_TO_DISTRIBUTOR"
                        ? "Company → Distributor"
                        : "Distributor → Super Team Leader";

                    return (

                      <tr
                        key={
                          transaction._id
                        }
                      >

                        <td>

                          {new Date(
                            transaction.createdAt
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        <td>
                          {transaction.product?.name ||
                            "-"}
                        </td>

                        <td>
                          {transaction.product?.sku ||
                            "-"}
                        </td>

                        <td>

                          <span className="dm-type-badge">
                            {typeLabel}
                          </span>

                        </td>

                        <td>
                          {transaction.from?.name ||
                            "Company"}
                        </td>

                        <td>
                          {transaction.to?.name ||
                            "-"}
                        </td>

                        <td>

                          <strong>
                            {transaction.to?.name
                              ? transaction.quantity
                              : transaction.quantity}
                          </strong>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default Transactions;