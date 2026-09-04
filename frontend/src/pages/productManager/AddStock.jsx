
import React, { useEffect, useMemo, useState } from "react";
import "./AddStock.css";
import { api } from "../../api";

// ======================================================
// COMPONENT
// ======================================================

function AddStock() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ======================================================
  // LOAD PRODUCTS
  // ======================================================

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/products");

      setProducts(data.products || []);
    } catch (err) {
      console.error("Load products error:", err);

      setError(
        err.message || "Unable to load products"
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      const name = String(
        product.name || ""
      ).toLowerCase();

      const sku = String(
        product.sku || ""
      ).toLowerCase();

      const category = String(
        product.category?.name || ""
      ).toLowerCase();

      return (
        name.includes(value) ||
        sku.includes(value) ||
        category.includes(value)
      );
    });
  }, [products, search]);

  // ======================================================
  // ADD STOCK
  // ======================================================

  async function handleAddStock(product) {
    if (saving) {
      return;
    }

    const currentStock = Number(
      product.stock || 0
    );

    // ----------------------------------------------------
    // ASK QUANTITY
    // ----------------------------------------------------

    const input = window.prompt(
      `Product: ${product.name}\n\n` +
        `Existing Stock: ${currentStock}\n\n` +
        `Kitni quantity add karni hai?`
    );

    // Cancel
    if (input === null) {
      return;
    }

    const quantity = Number(input);

    // ----------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      window.alert(
        "Please valid positive whole quantity enter karo."
      );

      return;
    }

    // ----------------------------------------------------
    // NEW STOCK
    // ----------------------------------------------------

    const newStock =
      currentStock + quantity;

    // ----------------------------------------------------
    // CONFIRM
    // ----------------------------------------------------

    const confirmed = window.confirm(
      `Product: ${product.name}\n\n` +
        `Existing Stock: ${currentStock}\n` +
        `Add Quantity: ${quantity}\n` +
        `New Stock: ${newStock}\n\n` +
        `Stock add karna hai?`
    );

    if (!confirmed) {
      return;
    }

    // ----------------------------------------------------
    // API
    // ----------------------------------------------------

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      /*
        Backend endpoint:

        POST
        /api/products/:id/stock/add

        Body:
        {
          quantity
        }
      */

      const data = await api(
        `/products/${product._id}/stock/add`,
        {
          method: "POST",

          body: JSON.stringify({
            quantity
          })
        }
      );

      // --------------------------------------------------
      // UPDATE PRODUCT
      // --------------------------------------------------

      const updatedProduct =
        data.product;

      if (!updatedProduct) {
        throw new Error(
          "Stock updated but updated product data was not returned."
        );
      }

      setProducts((previousProducts) =>
        previousProducts.map((item) =>
          String(item._id) ===
          String(product._id)
            ? {
                ...item,
                ...updatedProduct
              }
            : item
        )
      );

      // --------------------------------------------------
      // SUCCESS
      // --------------------------------------------------

      const finalStock = Number(
        data.newStock ??
          updatedProduct.stock ??
          newStock
      );

      setSuccess(
        `${product.name} ka stock successfully add ho gaya. New Stock: ${finalStock}`
      );
    } catch (err) {
      console.error(
        "Add stock error:",
        err
      );

      setError(
        err.message ||
          "Unable to add stock"
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
      <div className="add-stock-page">
        <div className="add-stock-loading">
          <div className="stock-spinner"></div>

          <p>
            Loading Products...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div className="add-stock-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="add-stock-header">
        <div>
          <h1>
            Add Stock
          </h1>

          <p>
            Company me aane wale naye stock ko
            existing stock me add karein.
          </p>
        </div>

        <button
          className="refresh-stock-btn"
          onClick={loadProducts}
          disabled={saving}
        >
          ↻ Refresh
        </button>
      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="stock-success">
          <span>✓</span>

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
        <div className="stock-error">
          <span>⚠</span>

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
          SEARCH
      ================================================= */}

      <div className="stock-search-card">

        <div className="search-title">
          <h2>
            Search Product
          </h2>

          <p>
            Product name, SKU ya category se
            search karein.
          </p>
        </div>

        <div className="search-box">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}
        </div>

        <div className="search-count">
          {filteredProducts.length} product
          {filteredProducts.length !== 1
            ? "s"
            : ""}{" "}
          found
        </div>
      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <div className="products-card">

        <div className="products-header">
          <div>
            <h2>
              Company Products
            </h2>

            <p>
              Product select karke Add Stock
              karein.
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-products">

            <div className="empty-icon">
              📦
            </div>

            <h3>
              Product nahi mila
            </h3>

            <p>
              Search change karke dobara try
              karein.
            </p>

          </div>
        ) : (
          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>
                <tr>
                  <th>#</th>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Existing Stock
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

                {filteredProducts.map(
                  (product, index) => {

                    const stock = Number(
                      product.stock || 0
                    );

                    const threshold =
                      Number(
                        product.lowStockThreshold ||
                          0
                      );

                    const isLowStock =
                      stock <= threshold;

                    return (
                      <tr
                        key={
                          product._id
                        }
                      >

                        {/* NUMBER */}

                        <td>
                          {index + 1}
                        </td>

                        {/* PRODUCT */}

                        <td>

                          <div className="product-info">

                            <div className="product-image">

                              {product.images &&
                              product.images.length >
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

                            <div>

                              <strong>
                                {
                                  product.name
                                }
                              </strong>

                              <small>
                                {
                                  product.description ||
                                  "No description"
                                }
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* SKU */}

                        <td>
                          {product.sku ||
                            "-"}
                        </td>

                        {/* CATEGORY */}

                        <td>
                          {product.category
                            ?.name || "-"}
                        </td>

                        {/* PRICE */}

                        <td>
                          {money(
                            product.price
                          )}
                        </td>

                        {/* STOCK */}

                        <td>

                          <span
                            className={
                              isLowStock
                                ? "stock-badge low"
                                : "stock-badge"
                            }
                          >
                            {stock}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              product.status ===
                              "ACTIVE"
                                ? "status-badge active"
                                : "status-badge inactive"
                            }
                          >
                            {
                              product.status ||
                              "ACTIVE"
                            }
                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            className="add-stock-btn"
                            onClick={() =>
                              handleAddStock(
                                product
                              )
                            }
                            disabled={
                              saving ||
                              product.status ===
                                "INACTIVE"
                            }
                          >
                            {saving
                              ? "Updating..."
                              : "+ Add Stock"}
                          </button>

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

    </div>
  );
}

export default AddStock;
