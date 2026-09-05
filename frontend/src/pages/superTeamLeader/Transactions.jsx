
import { useEffect, useState } from "react";
import "./SuperTeamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

function Transactions() {

  const [transactions, setTransactions] = useState([]);

  const [summary, setSummary] = useState({
    receivedQuantity: 0,
    transferredQuantity: 0,
    netMovement: 0,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ALL / IN / OUT
  const [transactionFilter, setTransactionFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(false);


  const token =
    localStorage.getItem("token");


  useEffect(() => {

    loadTransactions();

  }, []);


  // =====================================================
  // LOAD TRANSACTIONS
  // =====================================================

  async function loadTransactions() {

    try {

      setLoading(true);

      const params =
        new URLSearchParams();


      if (fromDate) {

        params.append(
          "fromDate",
          fromDate
        );

      }


      if (toDate) {

        params.append(
          "toDate",
          toDate
        );

      }


      const query =
        params.toString();


      const url =
        query
          ? `${API}/stock/transactions?${query}`
          : `${API}/stock/transactions`;


      const response =
        await fetch(
          url,
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
          "Unable to load transactions"
        );

      }


      setTransactions(
        data.transactions || []
      );


      setSummary(
        data.summary || {
          receivedQuantity: 0,
          transferredQuantity: 0,
          netMovement: 0,
        }
      );


    } catch (error) {

      console.error(
        "Transactions error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // STL TRANSACTION TYPE
  // =====================================================
  //
  // DISTRIBUTOR → STL = IN
  //
  // STL → TEAM LEADER = OUT
  //
  // =====================================================

  function getTransactionDirection(
    transaction
  ) {

    if (
      transaction.type ===
      "DISTRIBUTOR_TO_SUPER_TEAM_LEADER"
    ) {

      return "IN";

    }


    if (
      transaction.type ===
      "SUPER_TEAM_LEADER_TO_TEAM_LEADER"
    ) {

      return "OUT";

    }


    return "-";

  }


  // =====================================================
  // FILTER TRANSACTIONS
  // =====================================================

  const filteredTransactions =
    transactions.filter(
      (transaction) => {

        const direction =
          getTransactionDirection(
            transaction
          );


        if (
          transactionFilter ===
          "ALL"
        ) {

          return true;

        }


        return (
          direction ===
          transactionFilter
        );

      }
    );


  // =====================================================
  // FILTERED SUMMARY
  // =====================================================

  const filteredReceived =
    filteredTransactions
      .filter(
        (transaction) =>
          getTransactionDirection(
            transaction
          ) === "IN"
      )
      .reduce(
        (
          total,
          transaction
        ) =>
          total +
          Number(
            transaction.quantity || 0
          ),
        0
      );


  const filteredTransferred =
    filteredTransactions
      .filter(
        (transaction) =>
          getTransactionDirection(
            transaction
          ) === "OUT"
      )
      .reduce(
        (
          total,
          transaction
        ) =>
          total +
          Number(
            transaction.quantity || 0
          ),
        0
      );


  const filteredNet =
    filteredReceived -
    filteredTransferred;


  // =====================================================
  // TRANSACTION TYPE LABEL
  // =====================================================

  function getTransactionLabel(
    transaction
  ) {

    if (
      transaction.type ===
      "DISTRIBUTOR_TO_SUPER_TEAM_LEADER"
    ) {

      return "↓ IN";

    }


    if (
      transaction.type ===
      "SUPER_TEAM_LEADER_TO_TEAM_LEADER"
    ) {

      return "↑ OUT";

    }


    return (
      transaction.type
        ?.replaceAll("_", " ") ||
      "-"
    );

  }


  // =====================================================
  // TYPE CLASS
  // =====================================================

  function getTypeClass(
    transaction
  ) {

    const direction =
      getTransactionDirection(
        transaction
      );


    if (
      direction === "IN"
    ) {

      return "stl-status in";

    }


    if (
      direction === "OUT"
    ) {

      return "stl-status out";

    }


    return "stl-status";

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  function clearFilters() {

    setFromDate("");
    setToDate("");
    setTransactionFilter("ALL");

    setTimeout(
      () => {
        loadTransactions();
      },
      0
    );

  }


  return (

    <div className="stl-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="stl-header">

        <div>

          <h1>
            Stock Transactions
          </h1>

          <p>
            Track received and transferred stock.
          </p>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="stl-summary-grid">


        {/* RECEIVED */}

        <div className="stl-summary-card">

          <span>
            Received
          </span>

          <strong>
            +{filteredReceived}
          </strong>

        </div>


        {/* TRANSFERRED */}

        <div className="stl-summary-card">

          <span>
            Transferred
          </span>

          <strong>
            -{filteredTransferred}
          </strong>

        </div>


        {/* NET */}

        <div className="stl-summary-card">

          <span>
            Net Movement
          </span>

          <strong>
            {filteredNet}
          </strong>

        </div>


      </div>


      {/* =================================================
          DATE FILTER
      ================================================= */}

      <div className="stl-toolbar">


        {/* FROM */}

        <div>

          <label>
            From
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
          />

        </div>


        {/* TO */}

        <div>

          <label>
            To
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
          />

        </div>


        {/* SEARCH */}

        <button
          className="stl-btn primary"
          onClick={loadTransactions}
        >
          Search
        </button>


        {/* CLEAR */}

        <button
          className="stl-btn"
          onClick={clearFilters}
        >
          Clear
        </button>


      </div>


      {/* =================================================
          SHORTLIST BUTTONS
      ================================================= */}

      <div className="stl-transaction-filters">


        {/* ALL */}

        <button
          className={
            transactionFilter === "ALL"
              ? "stl-filter-btn active"
              : "stl-filter-btn"
          }
          onClick={() =>
            setTransactionFilter(
              "ALL"
            )
          }
        >
          All
        </button>


        {/* IN */}

        <button
          className={
            transactionFilter === "IN"
              ? "stl-filter-btn active in-filter"
              : "stl-filter-btn"
          }
          onClick={() =>
            setTransactionFilter(
              "IN"
            )
          }
        >
          ↓ IN
        </button>


        {/* OUT */}

        <button
          className={
            transactionFilter === "OUT"
              ? "stl-filter-btn active out-filter"
              : "stl-filter-btn"
          }
          onClick={() =>
            setTransactionFilter(
              "OUT"
            )
          }
        >
          ↑ OUT
        </button>


      </div>


      {/* =================================================
          TRANSACTION COUNT
      ================================================= */}

      <div className="stl-transaction-info">

        Showing{" "}

        <strong>
          {filteredTransactions.length}
        </strong>

        {" "}
        transactions


        {transactionFilter !== "ALL" && (

          <>
            {" "}—{" "}

            <strong>
              {transactionFilter}
            </strong>
          </>

        )}

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="stl-panel">

        <div className="stl-table-wrapper">

          <table className="stl-table">


            <thead>

              <tr>

                <th>
                  Date / Time
                </th>

                <th>
                  Product
                </th>

                <th>
                  SKU
                </th>

                <th>
                  Transaction
                </th>

                <th>
                  From
                </th>

                <th>
                  To
                </th>

                <th>
                  Quantity
                </th>

              </tr>

            </thead>


            <tbody>


              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="stl-empty-cell"
                  >
                    Loading transactions...
                  </td>

                </tr>

              ) : filteredTransactions.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="stl-empty-cell"
                  >
                    No transactions found.
                  </td>

                </tr>

              ) : (

                filteredTransactions.map(
                  (transaction) => {

                    const direction =
                      getTransactionDirection(
                        transaction
                      );


                    return (

                      <tr
                        key={
                          transaction._id
                        }
                      >


                        {/* DATE */}

                        <td>

                          {new Date(
                            transaction.createdAt
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* PRODUCT */}

                        <td>

                          <strong>
                            {
                              transaction
                                .product
                                ?.name ||
                              "-"
                            }
                          </strong>

                        </td>


                        {/* SKU */}

                        <td>

                          {
                            transaction
                              .product
                              ?.sku ||
                            "-"
                          }

                        </td>


                        {/* TRANSACTION */}

                        <td>

                          <span
                            className={
                              getTypeClass(
                                transaction
                              )
                            }
                          >

                            {getTransactionLabel(
                              transaction
                            )}

                          </span>

                        </td>


                        {/* FROM */}

                        <td>

                          {
                            transaction
                              .from
                              ?.name ||
                            "-"
                          }

                        </td>


                        {/* TO */}

                        <td>

                          {
                            transaction
                              .to
                              ?.name ||
                            "-"
                          }

                        </td>


                        {/* QUANTITY */}

                        <td>

                          <strong
                            className={
                              direction === "IN"
                                ? "stl-in-quantity"
                                : direction === "OUT"
                                ? "stl-out-quantity"
                                : ""
                            }
                          >

                            {direction === "IN"
                              ? "+"
                              : direction === "OUT"
                              ? "-"
                              : ""}

                            {
                              transaction.quantity
                            }

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

