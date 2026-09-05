
import React, { useEffect, useMemo, useState } from "react";
import "./TransferStock.css";
import { api } from "../../api";

// ======================================================
// COMPONENT
// ======================================================

function TransferStock() {
  const [products, setProducts] = useState([]);

  const [distributors, setDistributors] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedDistributor, setSelectedDistributor] =
    useState("");

  const [quantity, setQuantity] = useState("");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      setError("");

      const [stockData, distributorData] =
        await Promise.all([
          api("/products/stock"),
          api("/products/stock/distributors")
        ]);

      setProducts(
        stockData.products || []
      );

      setDistributors(
        distributorData.distributors || []
      );
    } catch (err) {
      console.error(
        "Load transfer data error:",
        err
      );

      setError(
        err.message ||
          "Unable to load transfer data"
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // SEARCH PRODUCTS
  // ======================================================

  const filteredProducts = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) => {
        const name =
          String(
            product.name || ""
          ).toLowerCase();

        const sku =
          String(
            product.sku || ""
          ).toLowerCase();

        const category =
          String(
            product.category?.name || ""
          ).toLowerCase();

        return (
          name.includes(value) ||
          sku.includes(value) ||
          category.includes(value)
        );
      }
    );
  }, [products, search]);

  // ======================================================
  // SELECT PRODUCT
  // ======================================================

  function handleSelectProduct(product) {
    setSelectedProduct(product);

    setQuantity("");

    setSuccess("");

    setError("");
  }

  // ======================================================
  // TRANSFER
  // ======================================================

  async function handleTransfer(e) {
    e.preventDefault();

    setError("");

    setSuccess("");

    // ----------------------------------------------------
    // PRODUCT
    // ----------------------------------------------------

    if (!selectedProduct) {
      setError(
        "Please select a product."
      );

      return;
    }

    // ----------------------------------------------------
    // DISTRIBUTOR
    // ----------------------------------------------------

    if (!selectedDistributor) {
      setError(
        "Please select a distributor."
      );

      return;
    }

    // ----------------------------------------------------
    // QUANTITY
    // ----------------------------------------------------

    const transferQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        transferQuantity
      ) ||
      transferQuantity <= 0
    ) {
      setError(
        "Please enter a valid positive whole quantity."
      );

      return;
    }

    // ----------------------------------------------------
    // COMPANY STOCK
    // ----------------------------------------------------

    const companyStock =
      Number(
        selectedProduct.stock || 0
      );

    if (
      transferQuantity >
      companyStock
    ) {
      setError(
        `Insufficient company stock. Available stock: ${companyStock}`
      );

      return;
    }

    // ----------------------------------------------------
    // FIND DISTRIBUTOR
    // ----------------------------------------------------

    const distributor =
      distributors.find(
        (item) =>
          String(item._id) ===
          String(selectedDistributor)
      );

    if (!distributor) {
      setError(
        "Selected distributor not found."
      );

      return;
    }

    // ----------------------------------------------------
    // CONFIRM
    // ----------------------------------------------------

    const remainingStock =
      companyStock -
      transferQuantity;

    const confirmed =
      window.confirm(
        `Product: ${selectedProduct.name}\n\n` +
          `Distributor: ${distributor.name}\n\n` +
          `Company Stock: ${companyStock}\n` +
          `Transfer Quantity: ${transferQuantity}\n` +
          `Remaining Company Stock: ${remainingStock}\n\n` +
          `Stock transfer karna hai?`
      );

    if (!confirmed) {
      return;
    }

    // ----------------------------------------------------
    // API
    // ----------------------------------------------------

    try {
      setSaving(true);

      const data =
        await api(
          "/products/stock/transfer",
          {
            method: "POST",

            body: JSON.stringify({
              productId:
                selectedProduct._id,

              toUserId:
                selectedDistributor,

              quantity:
                transferQuantity,

              note:
                note.trim()
            })
          }
        );

      // --------------------------------------------------
      // UPDATE COMPANY STOCK
      // --------------------------------------------------

      const newCompanyStock =
        Number(
          data.transfer
            ?.companyStockAfter ??
            remainingStock
        );

      setProducts(
        (previousProducts) =>
          previousProducts.map(
            (product) =>
              String(
                product._id
              ) ===
              String(
                selectedProduct._id
              )
                ? {
                    ...product,
                    stock:
                      newCompanyStock
                  }
                : product
          )
      );

      // --------------------------------------------------
      // UPDATE SELECTED PRODUCT
      // --------------------------------------------------

      setSelectedProduct(
        (previous) =>
          previous
            ? {
                ...previous,
                stock:
                  newCompanyStock
              }
            : previous
      );

      // --------------------------------------------------
      // SUCCESS
      // --------------------------------------------------

      setSuccess(
        `${selectedProduct.name} ka ${transferQuantity} stock ${distributor.name} ko successfully transfer ho gaya. Company stock: ${newCompanyStock}`
      );

      // --------------------------------------------------
      // RESET
      // --------------------------------------------------

      setQuantity("");

      setNote("");
    } catch (err) {
      console.error(
        "Transfer stock error:",
        err
      );

      setError(
        err.message ||
          "Unable to transfer stock"
      );
    } finally {
      setSaving(false);
    }
  }

  // ======================================================
  // MONEY
  // ======================================================

  function money(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="transfer-stock-page">

        <div className="transfer-loading">

          <div className="transfer-spinner"></div>

          <p>
            Loading stock and distributors...
          </p>

        </div>

      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div className="transfer-stock-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="transfer-header">

        <div>
          <h1>
            Transfer Stock
          </h1>

          <p>
            Company stock ko active distributors
            ko transfer karein.
          </p>
        </div>

        <button
          className="transfer-refresh-btn"
          onClick={loadData}
          disabled={saving}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="transfer-success">

          <span>
            ✓
          </span>

          <p>
            {success}
          </p>

          <button
            onClick={() =>
              setSuccess("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="transfer-error">

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
          TRANSFER FORM
      ================================================= */}

      <div className="transfer-grid">

        {/* =================================================
            LEFT - PRODUCTS
        ================================================= */}

        <div className="transfer-products-card">

          <div className="card-header">

            <div>
              <h2>
                Company Products
              </h2>

              <p>
                Transfer karne ke liye product
                select karein.
              </p>
            </div>

          </div>

          {/* SEARCH */}

          <div className="transfer-search">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
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

          {/* PRODUCT LIST */}

          <div className="transfer-product-list">

            {filteredProducts.length ===
            0 ? (
              <div className="transfer-empty">
                <div>
                  📦
                </div>

                <h3>
                  Product nahi mila
                </h3>

                <p>
                  Search change karke
                  dobara try karein.
                </p>
              </div>
            ) : (
              filteredProducts.map(
                (product) => {

                  const stock =
                    Number(
                      product.stock ||
                        0
                    );

                  const isSelected =
                    selectedProduct &&
                    String(
                      selectedProduct._id
                    ) ===
                      String(
                        product._id
                      );

                  return (
                    <button
                      key={
                        product._id
                      }
                      type="button"
                      className={
                        isSelected
                          ? "transfer-product selected"
                          : "transfer-product"
                      }
                      onClick={() =>
                        handleSelectProduct(
                          product
                        )
                      }
                    >

                      <div className="transfer-product-image">

                        {product.images &&
                        product.images
                          .length >
                          0 ? (
                          <img
                            src={
                              product.images[0]
                            }
                            alt={
                              product.name
                            }
                          />
                        ) : (
                          <span>
                            📦
                          </span>
                        )}

                      </div>

                      <div className="transfer-product-info">

                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <small>
                          SKU:{" "}
                          {product.sku ||
                            "-"}
                        </small>

                        <small>
                          Category:{" "}
                          {product
                            .category
                            ?.name ||
                            "-"}
                        </small>

                      </div>

                      <div className="transfer-product-stock">

                        <span>
                          Company Stock
                        </span>

                        <strong
                          className={
                            stock <=
                            Number(
                              product.lowStockThreshold ||
                                0
                            )
                              ? "low"
                              : ""
                          }
                        >
                          {stock}
                        </strong>

                      </div>

                    </button>
                  );
                }
              )
            )}

          </div>

        </div>

        {/* =================================================
            RIGHT - TRANSFER FORM
        ================================================= */}

        <div className="transfer-form-card">

          <div className="card-header">

            <div>
              <h2>
                Stock Transfer
              </h2>

              <p>
                Product aur distributor select
                karein.
              </p>
            </div>

          </div>

          {/* SELECTED PRODUCT */}

          {selectedProduct ? (
            <div className="selected-product-box">

              <div className="selected-product-icon">
                📦
              </div>

              <div>

                <span>
                  Selected Product
                </span>

                <strong>
                  {
                    selectedProduct.name
                  }
                </strong>

                <small>
                  Company Stock:{" "}
                  {Number(
                    selectedProduct.stock ||
                      0
                  )}
                </small>

              </div>

            </div>
          ) : (
            <div className="no-product-selected">

              <div>
                📦
              </div>

              <p>
                Pehle left side se product
                select karein.
              </p>

            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={
              handleTransfer
            }
          >

            {/* DISTRIBUTOR */}

            <div className="transfer-form-group">

              <label>
                Distributor
              </label>

              <select
                value={
                  selectedDistributor
                }
                onChange={(e) =>
                  setSelectedDistributor(
                    e.target.value
                  )
                }
                disabled={
                  saving
                }
              >

                <option value="">
                  Select Distributor
                </option>

                {distributors.map(
                  (distributor) => (
                    <option
                      key={
                        distributor._id
                      }
                      value={
                        distributor._id
                      }
                    >
                      {
                        distributor.name
                      }
                      {" — "}
                      {
                        distributor.email
                      }
                    </option>
                  )
                )}

              </select>

              {distributors.length ===
                0 && (
                <small className="field-warning">
                  Koi active distributor
                  available nahi hai.
                </small>
              )}

            </div>

            {/* QUANTITY */}

            <div className="transfer-form-group">

              <label>
                Transfer Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                disabled={
                  saving ||
                  !selectedProduct
                }
              />

              {selectedProduct && (
                <small>
                  Available company
                  stock:{" "}
                  <strong>
                    {Number(
                      selectedProduct.stock ||
                        0
                    )}
                  </strong>
                </small>
              )}

            </div>

            {/* NOTE */}

            <div className="transfer-form-group">

              <label>
                Note
                <span>
                  {" "}
                  (Optional)
                </span>
              </label>

              <textarea
                placeholder="Example: Monthly distributor stock"
                rows="4"
                value={note}
                onChange={(e) =>
                  setNote(
                    e.target.value
                  )
                }
                disabled={
                  saving
                }
              />

            </div>

            {/* PREVIEW */}

            {selectedProduct &&
              quantity &&
              Number(quantity) >
                0 && (
                <div className="transfer-preview">

                  <div>
                    <span>
                      Current Stock
                    </span>

                    <strong>
                      {Number(
                        selectedProduct.stock ||
                          0
                      )}
                    </strong>
                  </div>

                  <div className="minus">
                    <span>
                      Transfer
                    </span>

                    <strong>
                      -{" "}
                      {Number(
                        quantity
                      )}
                    </strong>
                  </div>

                  <div className="remaining">
                    <span>
                      Remaining
                    </span>

                    <strong>
                      {Math.max(
                        0,
                        Number(
                          selectedProduct.stock ||
                            0
                        ) -
                          Number(
                            quantity
                          )
                      )}
                    </strong>
                  </div>

                </div>
              )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="transfer-submit-btn"
              disabled={
                saving ||
                !selectedProduct ||
                !selectedDistributor ||
                !quantity ||
                distributors.length ===
                  0
              }
            >
              {saving
                ? "Transferring..."
                : "Transfer Stock"}
            </button>

          </form>

        </div>

      </div>

      {/* =================================================
          DISTRIBUTORS
      ================================================= */}

      <div className="distributors-card">

        <div className="card-header">

          <div>
            <h2>
              Active Distributors
            </h2>

            <p>
              Currently available Super Team
              Leaders.
            </p>
          </div>

          <span className="distributor-count">
            {distributors.length}
          </span>

        </div>

        {distributors.length ===
        0 ? (
          <div className="transfer-empty">

            <div>
              👥
            </div>

            <h3>
              No active distributors
            </h3>

            <p>
              Active Super Team Leader
              available nahi hai.
            </p>

          </div>
        ) : (
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
                    Phone
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {distributors.map(
                  (
                    distributor,
                    index
                  ) => (
                    <tr
                      key={
                        distributor._id
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        <div className="distributor-info">

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
                                distributor.name
                              }
                            </strong>

                            <small>
                              {
                                distributor.email
                              }
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>
                        {
                          distributor.phone ||
                          "-"
                        }
                      </td>

                      <td>

                        {[
                          distributor.city,
                          distributor.district,
                          distributor.state
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ", "
                          ) || "-"}

                      </td>

                      <td>

                        <span className="distributor-status">
                          ACTIVE
                        </span>

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

export default TransferStock;

