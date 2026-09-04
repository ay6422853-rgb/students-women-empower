import { useEffect, useState } from "react";
import "./distributionManager.css";

const API_URL = "http://localhost:5000/api";

function ReceiveStock() {

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");


  useEffect(() => {

    loadReceivedStock();

  }, []);


  async function loadReceivedStock() {

    try {

      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/stock/transactions?type=COMPANY_TO_DISTRIBUTOR`,
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

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }


  const totalReceived =
    transactions.reduce(
      (sum, transaction) =>
        sum +
        Number(
          transaction.quantity || 0
        ),
      0
    );


  return (

    <div className="dm-page">

      <div className="dm-page-header">

        <div>

          <h1>
            Receive Stock
          </h1>

          <p>
            Stock received from Company / Product Manager
          </p>

        </div>

      </div>


      <div className="dm-stat-grid">

        <div className="dm-stat-card">

          <div className="dm-stat-icon green">
            📥
          </div>

          <div>

            <span>
              Total Received
            </span>

            <strong>
              {totalReceived}
            </strong>

          </div>

        </div>


        <div className="dm-stat-card">

          <div className="dm-stat-icon blue">
            📋
          </div>

          <div>

            <span>
              Transactions
            </span>

            <strong>
              {transactions.length}
            </strong>

          </div>

        </div>

      </div>


      <div className="dm-card">

        <div className="dm-card-header">

          <div>

            <h2>
              Received Stock History
            </h2>

            <p>
              Company to Distribution Manager
            </p>

          </div>

          <button
            className="dm-secondary-btn"
            onClick={loadReceivedStock}
          >
            ↻ Refresh
          </button>

        </div>


        <div className="dm-table-wrapper">

          <table className="dm-table">

            <thead>

              <tr>

                <th>Date</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>From</th>
                <th>Note</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="dm-empty"
                  >
                    Loading...
                  </td>

                </tr>

              ) : transactions.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="dm-empty"
                  >
                    No received stock found
                  </td>

                </tr>

              ) : (

                transactions.map(
                  transaction => (

                    <tr
                      key={
                        transaction._id
                      }
                    >

                      <td>
                        {new Date(
                          transaction.createdAt
                        ).toLocaleString("en-IN")}
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

                        <strong className="dm-positive">
                          +{transaction.quantity}
                        </strong>

                      </td>

                      <td>
                        {transaction.from?.name ||
                          "Company"}
                      </td>

                      <td>
                        {transaction.note ||
                          "-"}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default ReceiveStock;