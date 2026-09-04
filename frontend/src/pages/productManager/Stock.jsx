
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./Stock.css";

function Stock() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  // ========================================
  // LOAD PRODUCTS
  // ========================================

  async function loadProducts(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await api("/products");

      setProducts(data.products || []);
    } catch (err) {
      console.error("Stock load error:", err);

      setError(
        err.message || "Unable to load stock."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ========================================
  // STOCK STATUS
  // ========================================

  function getStockStatus(product) {
    const stock = Number(product.stock || 0);

    const threshold =
      Number(product.lowStockThreshold || 0);

    // No stock
    if (stock <= 0) {
      return "OUT_OF_STOCK";
    }

    // Product-specific low stock threshold
    if (
      threshold > 0 &&
      stock <= threshold
    ) {
      return "LOW_STOCK";
    }

    return "NORMAL";
  }

  // ========================================
  // STATUS LABEL
  // ========================================

  function getStatusLabel(status) {
    switch (status) {
      case "OUT_OF_STOCK":
        return "OUT OF STOCK";

      case "LOW_STOCK":
        return "LOW STOCK";

      case "NORMAL":
        return "NORMAL";

      default:
        return status;
    }
  }

  // ========================================
  // FILTER PRODUCTS
  // ========================================

  const filteredProducts = useMemo(() => {
    const text = search
      .toLowerCase()
      .trim();

    return products.filter((product) => {
      // Search
      const matchesSearch =
        !text ||
        product.name
          ?.toLowerCase()
          .includes(text) ||
        product.sku
          ?.toLowerCase()
          .includes(text) ||
        product.category?.name
          ?.toLowerCase()
          .includes(text);

      // Product active/inactive
      if (
        filter === "ACTIVE" ||
        filter === "INACTIVE"
      ) {
        return (
          matchesSearch &&
          product.status === filter
        );
      }

      // Stock filters
      if (
        filter === "LOW_STOCK" ||
        filter === "OUT_OF_STOCK" ||
        filter === "NORMAL"
      ) {
        return (
          matchesSearch &&
          getStockStatus(product) === filter
        );
      }

      return matchesSearch;
    });
  }, [products, search, filter]);

  // ========================================
  // STATISTICS
  // ========================================

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let normal = 0;
    let totalUnits = 0;

    products.forEach((product) => {
      const stock = Number(
        product.stock || 0
      );

      totalUnits += stock;

      if (product.status === "ACTIVE") {
        active++;
      }

      if (product.status === "INACTIVE") {
        inactive++;
      }

      const stockStatus =
        getStockStatus(product);

      if (stockStatus === "LOW_STOCK") {
        lowStock++;
      }

      if (
        stockStatus === "OUT_OF_STOCK"
      ) {
        outOfStock++;
      }

      if (stockStatus === "NORMAL") {
        normal++;
      }
    });

    return {
      total: products.length,
      active,
      inactive,
      lowStock,
      outOfStock,
      normal,
      totalUnits
    };
  }, [products]);

  // ========================================
  // FILTER BUTTONS
  // ========================================

  const filters = [
    {
      key: "ALL",
      label: "All Products",
      count: stats.total
    },
    {
      key: "ACTIVE",
      label: "Active",
      count: stats.active
    },
    {
      key: "INACTIVE",
      label: "Inactive",
      count: stats.inactive
    },
    {
      key: "LOW_STOCK",
      label: "Low Stock",
      count: stats.lowStock
    },
    {
      key: "OUT_OF_STOCK",
      label: "Out of Stock",
      count: stats.outOfStock
    },
    {
      key: "NORMAL",
      label: "Normal Stock",
      count: stats.normal
    }
  ];

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="pm-page">
        <div className="pm-loading">
          Loading stock...
        </div>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="pm-page">

      {/* ====================================
          HEADER
      ==================================== */}

      <div className="pm-page-header">

        <div>
          <span className="pm-eyebrow">
            PRODUCT MANAGER
          </span>

          <h1>
            Stock Management
          </h1>

          <p>
            Monitor company inventory and
            identify products that need
            attention.
          </p>
        </div>

        <div className="pm-header-actions">

          <button
            className="pm-outline-button"
            onClick={() =>
              navigate(
                "/dashboard/product-manager"
              )
            }
          >
            ← Dashboard
          </button>

          <button
            className="pm-primary-button"
            onClick={() =>
              loadProducts(true)
            }
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>

      </div>


      {/* ====================================
          ERROR
      ==================================== */}

      {error && (
        <div className="pm-alert error">
          {error}
        </div>
      )}


      {/* ====================================
          STOCK SUMMARY
      ==================================== */}

      <div className="pm-stock-summary">

        <div className="pm-stock-summary-card">

          <div className="pm-summary-icon">
            📦
          </div>

          <div>
            <span>
              Total Products
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="pm-stock-summary-card">

          <div className="pm-summary-icon">
            ✓
          </div>

          <div>
            <span>
              Active Products
            </span>

            <strong>
              {stats.active}
            </strong>
          </div>

        </div>


        <div className="pm-stock-summary-card">

          <div className="pm-summary-icon warning">
            !
          </div>

          <div>
            <span>
              Low Stock
            </span>

            <strong>
              {stats.lowStock}
            </strong>
          </div>

        </div>


        <div className="pm-stock-summary-card">

          <div className="pm-summary-icon danger">
            ×
          </div>

          <div>
            <span>
              Out of Stock
            </span>

            <strong>
              {stats.outOfStock}
            </strong>
          </div>

        </div>


        <div className="pm-stock-summary-card">

          <div className="pm-summary-icon">
            #
          </div>

          <div>
            <span>
              Total Units
            </span>

            <strong>
              {stats.totalUnits.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* ====================================
          STOCK CARD
      ==================================== */}

      <div className="pm-card">

        <div className="pm-card-header">

          <div>
            <h2>
              Company Stock
            </h2>

            <p>
              Stock status is calculated
              using each product's own
              low-stock threshold.
            </p>
          </div>

        </div>


        {/* ==================================
            SEARCH
        ================================== */}

        <div className="pm-controls">

          <div className="pm-search">

            <span>
              🔎
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search product, SKU or category..."
            />

          </div>

        </div>


        {/* ==================================
            FILTERS
        ================================== */}

        <div className="pm-stock-filters">

          {filters.map((item) => (

            <button
              key={item.key}
              className={
                filter === item.key
                  ? "pm-stock-filter active"
                  : "pm-stock-filter"
              }
              onClick={() =>
                setFilter(item.key)
              }
            >

              <span>
                {item.label}
              </span>

              <strong>
                {item.count}
              </strong>

            </button>

          ))}

        </div>


        {/* ==================================
            RESULT INFO
        ================================== */}

        <div className="pm-result-bar">

          <span>
            Showing{" "}
            <strong>
              {filteredProducts.length}
            </strong>{" "}
            of{" "}
            <strong>
              {products.length}
            </strong>{" "}
            products
          </span>

          {filter !== "ALL" && (
            <button
              className="pm-clear-filter"
              onClick={() =>
                setFilter("ALL")
              }
            >
              Clear Filter ×
            </button>
          )}

        </div>


        {/* ==================================
            EMPTY
        ================================== */}

        {filteredProducts.length === 0 ? (

          <div className="pm-empty">

            <div>
              📦
            </div>

            <h3>
              No Products Found
            </h3>

            <p>
              No products match the selected
              filter or search.
            </p>

          </div>

        ) : (

          /* ==================================
             STOCK TABLE
          ================================== */

          <div className="pm-stock-table-wrapper">

            <table className="pm-stock-table">

              <thead>

                <tr>

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
                    Company Stock
                  </th>

                  <th>
                    Low Stock At
                  </th>

                  <th>
                    Stock Status
                  </th>

                  <th>
                    Product Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProducts.map(
                  (product) => {

                    const stock =
                      Number(
                        product.stock || 0
                      );

                    const threshold =
                      Number(
                        product.lowStockThreshold ||
                        0
                      );

                    const stockStatus =
                      getStockStatus(
                        product
                      );

                    return (

                      <tr
                        key={product._id}
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="pm-stock-product">

                            <div className="pm-stock-product-image">

                              {product.images?.length >
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
                                {product.name}
                              </strong>

                              <small>
                                ₹
                                {Number(
                                  product.price || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* SKU */}

                        <td>

                          <span className="pm-sku">
                            {product.sku || "-"}
                          </span>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="pm-category-tag">
                            {product.category?.name ||
                              "Uncategorized"}
                          </span>

                        </td>


                        {/* PRICE */}

                        <td>

                          <strong>
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </td>


                        {/* STOCK */}

                        <td>

                          <div className="pm-stock-number">

                            <strong
                              className={
                                stockStatus ===
                                "OUT_OF_STOCK"
                                  ? "danger"
                                  : stockStatus ===
                                    "LOW_STOCK"
                                  ? "warning"
                                  : "normal"
                              }
                            >
                              {stock.toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                            <span>
                              units
                            </span>

                          </div>

                        </td>


                        {/* THRESHOLD */}

                        <td>

                          <div className="pm-threshold">

                            <strong>
                              {threshold.toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                            <span>
                              units
                            </span>

                          </div>

                        </td>


                        {/* STOCK STATUS */}

                        <td>

                          <span
                            className={
                              `pm-stock-badge ${
                                stockStatus ===
                                "OUT_OF_STOCK"
                                  ? "danger"
                                  : stockStatus ===
                                    "LOW_STOCK"
                                  ? "warning"
                                  : "normal"
                              }`
                            }
                          >

                            {stockStatus ===
                            "OUT_OF_STOCK"
                              ? "×"
                              : stockStatus ===
                                "LOW_STOCK"
                              ? "!"
                              : "✓"}

                            {" "}

                            {getStatusLabel(
                              stockStatus
                            )}

                          </span>

                        </td>


                        {/* PRODUCT STATUS */}

                        <td>

                          <span
                            className={
                              product.status ===
                              "ACTIVE"
                                ? "pm-status active"
                                : "pm-status inactive"
                            }
                          >
                            {product.status}
                          </span>

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


      {/* ====================================
          LOW STOCK EXPLANATION
      ==================================== */}

      <div className="pm-stock-info">

        <div className="pm-stock-info-icon">
          ℹ
        </div>

        <div>

          <strong>
            How Low Stock works
          </strong>

          <p>
            Har product ka apna
            <b> Low Stock At </b>
            threshold hota hai. Agar
            company stock threshold ke
            barabar ya usse kam ho jata
            hai, product automatically
            <b> LOW STOCK </b>
            dikhega.
          </p>

          <p>
            Example: Stock = 1000 aur
            Low Stock At = 1100 →{" "}
            <b>LOW STOCK</b>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Stock;
