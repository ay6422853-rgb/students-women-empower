import React, { useEffect, useState } from "react";
import "./teamLeader.css";

const API = "http://localhost:5000/api";

function StockTransactions() {

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const token =
    localStorage.getItem("token");


  async function loadTransactions() {

    try {

      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API}/stock/transactions`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load stock transactions"
        );
      }


      setTransactions(
        data.transactions ||
        data.stockTransactions ||
        []
      );

    } catch (err) {

      console.error(err);
      setError(err.message);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadTransactions();
  }, []);


  return (
    <div className="tl-page">

      <div className="tl-page-header">

        <div>

          <h1>
            Stock Transactions
          </h1>

          <p>
            Complete history of your
            stock movements
          </p>

        </div>

        <button
          className="tl-btn secondary"
          onClick={loadTransactions}
        >
          Refresh
        </button>

      </div>


      {error && (
        <div className="tl-error">
          {error}
        </div>
      )}


      {loading ? (

        <div className="tl-loading">
          Loading stock transactions...
        </div>

      ) : transactions.length === 0 ? (

        <div className="tl-empty">
          No stock transactions found.
        </div>

      ) : (

        <div className="tl-table-wrapper">

          <table className="tl-table">

            <thead>

              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
              </tr>

            </thead>

            <tbody>

              {transactions.map(
                (transaction, index) => {

                  const product =
                    transaction.product ||
                    {};

                  return (

                    <tr
                      key={
                        transaction._id ||
                        index
                      }
                    >

                      <td>
                        <strong>
                          {product.name ||
                            transaction.productName ||
                            "Product"}
                        </strong>

                        <br />

                        <small>
                          {product.sku ||
                            transaction.sku ||
                            ""}
                        </small>
                      </td>


                      <td>

                        <span
                          className={`tl-status ${
                            String(
                              transaction.type ||
                              ""
                            ).toLowerCase()
                          }`}
                        >
                          {transaction.type ||
                            "TRANSFER"}
                        </span>

                      </td>


                      <td>
                        <strong>
                          {transaction.quantity ||
                            0}
                        </strong>
                      </td>


                      <td>
                        {transaction.from?.name ||
                          transaction.fromUser?.name ||
                          "-"}
                      </td>


                      <td>
                        {transaction.to?.name ||
                          transaction.toUser?.name ||
                          "-"}
                      </td>


                      <td>
                        {transaction.createdAt
                          ? new Date(
                              transaction.createdAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default StockTransactions;