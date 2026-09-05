
import React, { useEffect, useMemo, useState } from "react";
import "./Distributors.css";
import { api } from "../../api";

function Distributors() {

  const [distributors, setDistributors] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedDistributor, setSelectedDistributor] =
    useState(null);


  // =====================================================
  // LOAD DISTRIBUTORS
  // =====================================================

  useEffect(() => {
    loadDistributors();
  }, []);


  async function loadDistributors() {

    try {

      setLoading(true);
      setError("");

      const result =
        await api("/stock/distribution-managers");

      setDistributors(
        result.distributionManagers || []
      );

    } catch (err) {

      console.error(
        "Distributor load error:",
        err
      );

      setError(
        err.message ||
        "Unable to load distributors"
      );

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // MONEY
  // =====================================================

  function money(value) {

    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;

  }


  // =====================================================
  // FILTER
  // =====================================================

  const filteredDistributors = useMemo(() => {

    const value =
      search
        .trim()
        .toLowerCase();


    if (!value) {
      return distributors;
    }


    return distributors.filter(
      (item) => {

        const distributor =
          item.distributor || {};


        const fields = [

          distributor.name,

          distributor.email,

          distributor.phone,

          distributor.city,

          distributor.district,

          distributor.state,

          distributor.pincode

        ];


        return fields.some(
          (field) =>
            String(field || "")
              .toLowerCase()
              .includes(value)
        );

      }
    );

  }, [
    distributors,
    search
  ]);


  // =====================================================
  // STOCK VALUE
  // =====================================================

  function getStockValue(distributor) {

    return (
      distributor.products || []
    ).reduce(
      (total, product) =>
        total +
        Number(
          product.stockValue || 0
        ),
      0
    );

  }


  // =====================================================
  // TOTAL STOCK
  // =====================================================

  const totalStock =
    distributors.reduce(
      (total, distributor) =>
        total +
        Number(
          distributor.totalQuantity || 0
        ),
      0
    );


  // =====================================================
  // TOTAL STOCK VALUE
  // =====================================================

  const totalStockValue =
    distributors.reduce(
      (total, distributor) =>
        total +
        getStockValue(distributor),
      0
    );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="distributors-page">

        <div className="distributors-loading">

          <div className="distributors-spinner"></div>

          <p>
            Loading distributors...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // MAIN
  // =====================================================

  return (

    <div className="distributors-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="distributors-header">

        <div>

          <h1>
            Distributors
          </h1>

          <p>
            Sabhi active distributors ki complete
            information yahan dekhein.
          </p>

        </div>


        <button
          className="distributors-refresh-btn"
          onClick={loadDistributors}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="distributors-error">

          <span>
            ⚠
          </span>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="distributors-summary">


        <div className="distributor-summary-card">

          <div className="distributor-summary-icon">
            👥
          </div>

          <div>

            <span>
              Total Distributors
            </span>

            <strong>
              {distributors.length}
            </strong>

          </div>

        </div>


        <div className="distributor-summary-card">

          <div className="distributor-summary-icon">
            📦
          </div>

          <div>

            <span>
              Total Stock
            </span>

            <strong>
              {totalStock}
            </strong>

          </div>

        </div>


        <div className="distributor-summary-card">

          <div className="distributor-summary-icon">
            🛍️
          </div>

          <div>

            <span>
              Products
            </span>

            <strong>
              {new Set(
                distributors.flatMap(
                  (item) =>
                    (item.products || [])
                      .map(
                        (product) =>
                          String(
                            product.productId
                          )
                      )
                )
              ).size}
            </strong>

          </div>

        </div>


        <div className="distributor-summary-card">

          <div className="distributor-summary-icon">
            💰
          </div>

          <div>

            <span>
              Stock Value
            </span>

            <strong>
              {money(totalStockValue)}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="distributors-search-card">

        <div>

          <h2>
            Search Distributors
          </h2>

          <p>
            Name, email, phone, city, district,
            state ya pincode se search karein.
          </p>

        </div>


        <div className="distributors-search-box">

          <span>
            🔍
          </span>

          <input
            type="search"
            placeholder="Search distributor..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (

            <button
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>

          )}

        </div>

      </div>


      {/* =================================================
          RESULT HEADER
      ================================================= */}

      <div className="distributors-result-header">

        <div>

          <h2>
            Distributor List
          </h2>

          <p>
            {filteredDistributors.length}
            {" "}
            distributors showing
          </p>

        </div>

        {search && (

          <button
            className="clear-distributor-search"
            onClick={() =>
              setSearch("")
            }
          >
            Clear Search
          </button>

        )}

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      {filteredDistributors.length === 0 ? (

        <div className="distributors-empty">

          <div>
            👥
          </div>

          <h3>
            Distributor nahi mila
          </h3>

          <p>
            Search keyword change karke
            dobara try karein.
          </p>

        </div>

      ) : (

        <div className="distributors-table-card">

          <div className="distributors-table-wrapper">

            <table className="distributors-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Distributor
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Products
                  </th>

                  <th>
                    Stock Value
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredDistributors.map(
                  (item, index) => {

                    const distributor =
                      item.distributor || {};

                    const stockValue =
                      getStockValue(item);


                    return (

                      <tr
                        key={
                          distributor.id ||
                          index
                        }
                      >


                        {/* NUMBER */}

                        <td>
                          {index + 1}
                        </td>


                        {/* DISTRIBUTOR */}

                        <td>

                          <div className="distributor-person">

                            <div className="distributor-avatar">

                              {(
                                distributor.name ||
                                "D"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>


                            <div>

                              <strong>
                                {
                                  distributor.name ||
                                  "-"
                                }
                              </strong>

                              <small>
                                {
                                  distributor.email ||
                                  "-"
                                }
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* CONTACT */}

                        <td>

                          <div className="contact-info">

                            <strong>
                              📱{" "}
                              {
                                distributor.phone ||
                                "-"
                              }
                            </strong>

                            <small>
                              📧{" "}
                              {
                                distributor.email ||
                                "-"
                              }
                            </small>

                          </div>

                        </td>


                        {/* LOCATION */}

                        <td>

                          <div className="location-info">

                            <strong>
                              {
                                distributor.city ||
                                "-"
                              }
                            </strong>

                            <small>
                              {[
                                distributor.district,
                                distributor.state
                              ]
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </small>

                            <small>
                              PIN:{" "}
                              {
                                distributor.pincode ||
                                "-"
                              }
                            </small>

                          </div>

                        </td>


                        {/* STOCK */}

                        <td>

                          <span className="stock-number">

                            {
                              item.totalQuantity ||
                              0
                            }

                          </span>

                          <small className="stock-unit">
                            Units
                          </small>

                        </td>


                        {/* PRODUCTS */}

                        <td>

                          <span className="product-count">

                            {
                              (
                                item.products ||
                                []
                              ).length
                            }

                          </span>

                        </td>


                        {/* VALUE */}

                        <td>

                          <strong className="stock-value">

                            {money(
                              stockValue
                            )}

                          </strong>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span className="distributor-status">

                            🟢{" "}
                            {
                              distributor.status ||
                              "ACTIVE"
                            }

                          </span>

                        </td>


                        {/* VIEW */}

                        <td>

                          <button
                            type="button"
                            className="view-distributor-btn"
                            onClick={() =>
                              setSelectedDistributor(
                                item
                              )
                            }
                          >
                            👁 View
                          </button>

                        </td>


                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* =================================================
          VIEW DETAILS MODAL
      ================================================= */}

      {selectedDistributor && (

        <div
          className="distributor-details-overlay"
          onClick={() =>
            setSelectedDistributor(null)
          }
        >

          <div
            className="distributor-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="details-modal-header">

              <div className="details-person">

                <div className="details-avatar">

                  {(
                    selectedDistributor
                      .distributor?.name ||
                    "D"
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <h2>
                    {
                      selectedDistributor
                        .distributor?.name ||
                      "Distributor"
                    }
                  </h2>

                  <p>
                    DISTRIBUTION MANAGER
                  </p>

                </div>

              </div>


              <button
                className="details-close-btn"
                onClick={() =>
                  setSelectedDistributor(
                    null
                  )
                }
              >
                ×
              </button>

            </div>


            {/* BASIC INFORMATION */}

            <div className="details-section">

              <div className="details-section-title">

                <h3>
                  Personal & Contact Information
                </h3>

              </div>


              <div className="details-info-grid">


                <div className="details-info-item">

                  <span>
                    Full Name
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.name ||
                      "-"
                    }
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Email
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.email ||
                      "-"
                    }
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Contact Number
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.phone ||
                      "-"
                    }
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Role
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.role ||
                      "DISTRIBUTION_MANAGER"
                    }
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    City
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.city ||
                      "-"
                    }
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    District
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.district ||
                      "-"
                    }
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    State
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.state ||
                      "-"
                    }
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Pincode
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .distributor?.pincode ||
                      "-"
                    }
                  </strong>

                </div>

              </div>

            </div>


            {/* STOCK SUMMARY */}

            <div className="details-section">

              <div className="details-section-title">

                <h3>
                  Stock Information
                </h3>

              </div>


              <div className="details-stock-grid">


                <div className="details-stock-card">

                  <span>
                    Total Stock
                  </span>

                  <strong>
                    {
                      selectedDistributor
                        .totalQuantity ||
                      0
                    }
                  </strong>

                  <small>
                    Units
                  </small>

                </div>


                <div className="details-stock-card">

                  <span>
                    Total Products
                  </span>

                  <strong>
                    {
                      (
                        selectedDistributor
                          .products ||
                        []
                      ).length
                    }
                  </strong>

                  <small>
                    Products
                  </small>

                </div>


                <div className="details-stock-card">

                  <span>
                    Stock Value
                  </span>

                  <strong>
                    {money(
                      getStockValue(
                        selectedDistributor
                      )
                    )}
                  </strong>

                  <small>
                    Current Value
                  </small>

                </div>

              </div>

            </div>


            {/* PRODUCTS */}

            <div className="details-section">

              <div className="details-section-title">

                <div>

                  <h3>
                    Distributor Products
                  </h3>

                  <p>
                    Distributor ke paas
                    available products.
                  </p>

                </div>

                <span>
                  {
                    (
                      selectedDistributor.products ||
                      []
                    ).length
                  } Products
                </span>

              </div>


              {(
                selectedDistributor.products ||
                []
              ).length === 0 ? (

                <div className="details-no-stock">

                  <div>
                    📦
                  </div>

                  <p>
                    Is distributor ke paas
                    abhi koi stock nahi hai.
                  </p>

                </div>

              ) : (

                <div className="details-products-table-wrapper">

                  <table className="details-products-table">

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th>
                          SKU
                        </th>

                        <th>
                          Price
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Stock Value
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {(
                        selectedDistributor.products ||
                        []
                      ).map(
                        (product, index) => (

                          <tr
                            key={
                              product.productId ||
                              index
                            }
                          >

                            <td>

                              <strong>
                                {
                                  product.name ||
                                  "-"
                                }
                              </strong>

                            </td>

                            <td>
                              {
                                product.sku ||
                                "-"
                              }
                            </td>

                            <td>
                              {money(
                                product.price
                              )}
                            </td>

                            <td>

                              <span className="details-quantity">

                                {
                                  product.quantity ||
                                  0
                                }

                              </span>

                            </td>

                            <td>

                              <strong className="details-value">

                                {money(
                                  product.stockValue
                                )}

                              </strong>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>


            {/* MODAL FOOTER */}

            <div className="details-modal-footer">

              <button
                className="details-close-footer-btn"
                onClick={() =>
                  setSelectedDistributor(
                    null
                  )
                }
              >
                Close
              </button>

            </div>


          </div>

        </div>

      )}

    </div>

  );
}

export default Distributors;

