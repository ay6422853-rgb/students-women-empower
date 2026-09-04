
import React, { useEffect, useMemo, useState } from "react";
import "./DistributorStock.css";
import { api } from "../../api";

function DistributorStock() {
  const [data, setData] = useState({
    summary: {
      totalDistributors: 0,
      totalStock: 0,
      totalProducts: 0
    },
    distributionManagers: [],
    productWiseTotals: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Distributor search
  const [distributorSearch, setDistributorSearch] = useState("");

  // Product search
  const [productSearch, setProductSearch] = useState("");

  // Selected product
  const [selectedProductId, setSelectedProductId] = useState("");

  // ------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const result = await api(
        "/stock/distribution-managers"
      );

      setData({
        summary: result.summary || {
          totalDistributors: 0,
          totalStock: 0,
          totalProducts: 0
        },

        distributionManagers:
          result.distributionManagers || [],

        productWiseTotals:
          result.productWiseTotals || []
      });
    } catch (err) {
      console.error(
        "Distributor stock load error:",
        err
      );

      setError(
        err.message ||
          "Unable to load distributor stock"
      );
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------
  // MONEY
  // ------------------------------------------------------

  function money(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  // ------------------------------------------------------
  // ALL PRODUCTS
  // ------------------------------------------------------

  const allProducts = useMemo(() => {
    const map = new Map();

    data.distributionManagers.forEach(
      (manager) => {
        (manager.products || []).forEach(
          (product) => {
            const id = String(
              product.productId
            );

            if (!map.has(id)) {
              map.set(id, {
                productId:
                  product.productId,

                name:
                  product.name,

                sku:
                  product.sku,

                price:
                  product.price || 0
              });
            }
          }
        );
      }
    );

    return Array.from(
      map.values()
    ).sort((a, b) =>
      String(a.name).localeCompare(
        String(b.name)
      )
    );
  }, [data.distributionManagers]);

  // ------------------------------------------------------
  // PRODUCT SEARCH
  // ------------------------------------------------------

  const filteredProducts = useMemo(() => {
    const value =
      productSearch
        .trim()
        .toLowerCase();

    if (!value) {
      return allProducts;
    }

    return allProducts.filter(
      (product) => {
        const name =
          String(
            product.name || ""
          ).toLowerCase();

        const sku =
          String(
            product.sku || ""
          ).toLowerCase();

        return (
          name.includes(value) ||
          sku.includes(value)
        );
      }
    );
  }, [
    allProducts,
    productSearch
  ]);

  // ------------------------------------------------------
  // SELECTED PRODUCT
  // ------------------------------------------------------

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) {
      return null;
    }

    return (
      allProducts.find(
        (product) =>
          String(
            product.productId
          ) ===
          String(
            selectedProductId
          )
      ) || null
    );
  }, [
    allProducts,
    selectedProductId
  ]);

  // ------------------------------------------------------
  // PRODUCT-WISE DISTRIBUTOR DATA
  // ------------------------------------------------------

  const selectedProductDistributors =
    useMemo(() => {
      if (!selectedProductId) {
        return [];
      }

      const result = [];

      data.distributionManagers.forEach(
        (manager) => {
          const product =
            (manager.products || []).find(
              (item) =>
                String(
                  item.productId
                ) ===
                String(
                  selectedProductId
                )
            );

          if (product) {
            result.push({
              ...manager,
              product
            });
          }
        }
      );

      return result;
    }, [
      data.distributionManagers,
      selectedProductId
    ]);

  // ------------------------------------------------------
  // SELECTED PRODUCT TOTAL
  // ------------------------------------------------------

  const selectedProductTotal =
    useMemo(() => {
      return selectedProductDistributors.reduce(
        (total, item) =>
          total +
          Number(
            item.product?.quantity || 0
          ),
        0
      );
    }, [
      selectedProductDistributors
    ]);

  // ------------------------------------------------------
  // DISTRIBUTOR SEARCH
  // ------------------------------------------------------

  const filteredDistributors =
    useMemo(() => {
      const value =
        distributorSearch
          .trim()
          .toLowerCase();

      let result =
        data.distributionManagers;

      // Product filter
      if (selectedProductId) {
        result = result.filter(
          (manager) =>
            (manager.products || []).some(
              (product) =>
                String(
                  product.productId
                ) ===
                  String(
                    selectedProductId
                  ) &&
                Number(
                  product.quantity || 0
                ) > 0
            )
        );
      }

      // Distributor search
      if (value) {
        result = result.filter(
          (manager) => {
            const distributor =
              manager.distributor || {};

            const name =
              String(
                distributor.name || ""
              ).toLowerCase();

            const email =
              String(
                distributor.email || ""
              ).toLowerCase();

            const phone =
              String(
                distributor.phone || ""
              ).toLowerCase();

            const city =
              String(
                distributor.city || ""
              ).toLowerCase();

            return (
              name.includes(value) ||
              email.includes(value) ||
              phone.includes(value) ||
              city.includes(value)
            );
          }
        );
      }

      return result;
    }, [
      data.distributionManagers,
      distributorSearch,
      selectedProductId
    ]);

  // ------------------------------------------------------
  // FILTERED TOTAL
  // ------------------------------------------------------

  const filteredTotalStock =
    useMemo(() => {
      return filteredDistributors.reduce(
        (total, manager) => {
          if (selectedProductId) {
            const product =
              (manager.products || []).find(
                (item) =>
                  String(
                    item.productId
                  ) ===
                  String(
                    selectedProductId
                  )
              );

            return (
              total +
              Number(
                product?.quantity || 0
              )
            );
          }

          return (
            total +
            Number(
              manager.totalQuantity || 0
            )
          );
        },
        0
      );
    }, [
      filteredDistributors,
      selectedProductId
    ]);

  // ------------------------------------------------------
  // CLEAR FILTERS
  // ------------------------------------------------------

  function clearFilters() {
    setDistributorSearch("");
    setProductSearch("");
    setSelectedProductId("");
  }

  // ------------------------------------------------------
  // LOADING
  // ------------------------------------------------------

  if (loading) {
    return (
      <div className="distributor-stock-page">

        <div className="distributor-stock-loading">

          <div className="distributor-stock-spinner"></div>

          <p>
            Loading distributor stock...
          </p>

        </div>

      </div>
    );
  }

  // ------------------------------------------------------
  // MAIN
  // ------------------------------------------------------

  return (
    <div className="distributor-stock-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="distributor-stock-header">

        <div>
          <h1>
            Distributor Stock
          </h1>

          <p>
            Har distributor ke paas kitna
            product stock hai, yahan dekhein.
          </p>
        </div>

        <button
          className="distributor-refresh-btn"
          onClick={loadData}
        >
          ↻ Refresh
        </button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="distributor-stock-error">

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

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="stock-summary-grid">

        <div className="stock-summary-card">

          <div className="summary-icon">
            👥
          </div>

          <div>
            <span>
              Total Distributors
            </span>

            <strong>
              {
                data.summary
                  .totalDistributors
              }
            </strong>
          </div>

        </div>

        <div className="stock-summary-card">

          <div className="summary-icon">
            📦
          </div>

          <div>
            <span>
              Total Distributor Stock
            </span>

            <strong>
              {
                data.summary
                  .totalStock
              }
            </strong>
          </div>

        </div>

        <div className="stock-summary-card">

          <div className="summary-icon">
            🛍️
          </div>

          <div>
            <span>
              Total Products
            </span>

            <strong>
              {
                data.summary
                  .totalProducts
              }
            </strong>
          </div>

        </div>

        <div className="stock-summary-card">

          <div className="summary-icon">
            💰
          </div>

          <div>
            <span>
              Distributor Stock Value
            </span>

            <strong>
              {money(
                data.distributionManagers.reduce(
                  (
                    total,
                    manager
                  ) =>
                    total +
                    (manager.products || []).reduce(
                      (
                        productTotal,
                        product
                      ) =>
                        productTotal +
                        Number(
                          product.stockValue ||
                            0
                        ),
                      0
                    ),
                  0
                )
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* ==================================================
          PRODUCT SEARCH
      ================================================== */}

      <div className="product-search-card">

        <div className="search-card-title">

          <div>
            <h2>
              Product Wise Stock Search
            </h2>

            <p>
              Kisi product ko select karke
              dekhein ki kaun-kaun distributor
              ke paas woh product hai.
            </p>
          </div>

        </div>

        <div className="product-search-row">

          <div className="search-input-box">

            <span>
              🔍
            </span>

            <input
              type="search"
              placeholder="Search product name or SKU..."
              value={productSearch}
              onChange={(e) =>
                setProductSearch(
                  e.target.value
                )
              }
            />

            {productSearch && (
              <button
                onClick={() =>
                  setProductSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          <select
            value={
              selectedProductId
            }
            onChange={(e) =>
              setSelectedProductId(
                e.target.value
              )
            }
          >

            <option value="">
              All Products
            </option>

            {filteredProducts.map(
              (product) => (
                <option
                  key={
                    product.productId
                  }
                  value={
                    product.productId
                  }
                >
                  {product.name}
                  {" — "}
                  {product.sku || "-"}
                </option>
              )
            )}

          </select>

        </div>

        {/* SELECTED PRODUCT */}

        {selectedProduct && (
          <div className="selected-stock-product">

            <div className="selected-product-image">
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
                SKU:{" "}
                {
                  selectedProduct.sku ||
                  "-"
                }
              </small>

            </div>

            <div className="selected-product-total">

              <span>
                Total Distributor Stock
              </span>

              <strong>
                {selectedProductTotal}
              </strong>

            </div>

          </div>
        )}

      </div>

      {/* ==================================================
          DISTRIBUTOR SEARCH
      ================================================== */}

      <div className="distributor-search-card">

        <div className="distributor-search-left">

          <div>
            <h2>
              Distributor Stock Details
            </h2>

            <p>
              {selectedProduct
                ? `${selectedProduct.name} ka distributor-wise stock`
                : "Distributor-wise complete stock"}
            </p>
          </div>

          <span className="result-count">
            {
              filteredDistributors.length
            }
            {" "}
            Distributors
          </span>

        </div>

        <div className="distributor-search-row">

          <div className="search-input-box">

            <span>
              🔍
            </span>

            <input
              type="search"
              placeholder="Search distributor name, email, phone or city..."
              value={
                distributorSearch
              }
              onChange={(e) =>
                setDistributorSearch(
                  e.target.value
                )
              }
            />

            {distributorSearch && (
              <button
                onClick={() =>
                  setDistributorSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          {(distributorSearch ||
            selectedProductId ||
            productSearch) && (
            <button
              className="clear-filter-btn"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>
          )}

        </div>

      </div>

      {/* ==================================================
          PRODUCT-WISE RESULT
      ================================================== */}

      {selectedProduct && (
        <div className="product-result-card">

          <div className="product-result-header">

            <div>
              <h2>
                {selectedProduct.name}
              </h2>

              <p>
                Is product ka stock kis
                distributor ke paas hai.
              </p>
            </div>

            <div className="product-total-badge">
              Total:{" "}
              <strong>
                {selectedProductTotal}
              </strong>
              {" "}Units
            </div>

          </div>

          {selectedProductDistributors.length ===
          0 ? (
            <div className="stock-empty">

              <div>
                📦
              </div>

              <h3>
                Is product ka distributor
                stock nahi hai.
              </h3>

              <p>
                Abhi kisi active distributor
                ke paas ye product available
                nahi hai.
              </p>

            </div>
          ) : (
            <div className="product-distributor-table-wrapper">

              <table className="product-distributor-table">

                <thead>
                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Distributor
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Product
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

                  {selectedProductDistributors.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={
                          item.distributor
                            ?.id
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="stock-distributor-info">

                            <div className="stock-avatar">
                              {(
                                item.distributor
                                  ?.name ||
                                "D"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {
                                  item
                                    .distributor
                                    ?.name
                                }
                              </strong>

                              <small>
                                {
                                  item
                                    .distributor
                                    ?.email
                                }
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>

                          {[
                            item.distributor
                              ?.city,
                            item.distributor
                              ?.district,
                            item.distributor
                              ?.state
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              ", "
                            ) || "-"}

                        </td>

                        <td>

                          <strong>
                            {
                              item.product
                                ?.name
                            }
                          </strong>

                          <small className="table-muted">
                            SKU:{" "}
                            {
                              item.product
                                ?.sku ||
                              "-"
                            }
                          </small>

                        </td>

                        <td>

                          <span className="quantity-badge">
                            {
                              Number(
                                item.product
                                  ?.quantity ||
                                0
                              )
                            }
                          </span>

                        </td>

                        <td>

                          {money(
                            item.product
                              ?.stockValue
                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* ==================================================
          ALL DISTRIBUTORS
      ================================================== */}

      {!selectedProduct && (
        <div className="all-distributors-card">

          <div className="all-distributors-header">

            <div>
              <h2>
                All Distributor Stock
              </h2>

              <p>
                Har distributor ke paas
                available products.
              </p>
            </div>

            <div className="filtered-total">

              <span>
                Showing Stock
              </span>

              <strong>
                {
                  filteredTotalStock
                }
              </strong>

            </div>

          </div>

          {filteredDistributors.length ===
          0 ? (
            <div className="stock-empty">

              <div>
                👥
              </div>

              <h3>
                Distributor nahi mila
              </h3>

              <p>
                Search change karke
                dobara try karein.
              </p>

            </div>
          ) : (
            <div className="all-distributors-table-wrapper">

              <table className="all-distributors-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Distributor
                    </th>

                    <th>
                      Total Stock
                    </th>

                    <th>
                      Products
                    </th>

                    <th>
                      Stock Value
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredDistributors.map(
                    (
                      manager,
                      index
                    ) => {

                      const totalValue =
                        (
                          manager.products ||
                          []
                        ).reduce(
                          (
                            total,
                            product
                          ) =>
                            total +
                            Number(
                              product.stockValue ||
                                0
                            ),
                          0
                        );

                      return (
                        <tr
                          key={
                            manager.distributor
                              ?.id
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>

                            <div className="stock-distributor-info">

                              <div className="stock-avatar">
                                {(
                                  manager
                                    .distributor
                                    ?.name ||
                                  "D"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {
                                    manager
                                      .distributor
                                      ?.name
                                  }
                                </strong>

                                <small>
                                  {
                                    manager
                                      .distributor
                                      ?.email
                                  }
                                </small>

                              </div>

                            </div>

                          </td>

                          <td>

                            <span className="quantity-badge">
                              {
                                manager.totalQuantity ||
                                0
                              }
                            </span>

                          </td>

                          <td>

                            <span className="product-count-badge">
                              {
                                (
                                  manager.products ||
                                  []
                                ).length
                              }
                            </span>

                          </td>

                          <td>

                            {money(
                              totalValue
                            )}

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
      )}

      {/* ==================================================
          PRODUCT WISE TOTAL
      ================================================== */}

      <div className="product-wise-total-card">

        <div className="product-wise-total-header">

          <div>
            <h2>
              Product Wise Total Distributor Stock
            </h2>

            <p>
              Sabhi distributors ko mila kar
              har product ka total stock.
            </p>
          </div>

          <span>
            {
              data.productWiseTotals.length
            }
            {" "}
            Products
          </span>

        </div>

        <div className="product-wise-grid">

          {data.productWiseTotals.map(
            (product) => (

              <button
                type="button"
                key={
                  product.productId
                }
                className={
                  String(
                    selectedProductId
                  ) ===
                  String(
                    product.productId
                  )
                    ? "product-total-item active"
                    : "product-total-item"
                }
                onClick={() => {
                  setSelectedProductId(
                    product.productId
                  );

                  setProductSearch(
                    product.name || ""
                  );
                }}
              >

                <div className="product-total-icon">
                  📦
                </div>

                <div className="product-total-info">

                  <strong>
                    {
                      product.name
                    }
                  </strong>

                  <small>
                    SKU:{" "}
                    {
                      product.sku ||
                      "-"
                    }
                  </small>

                </div>

                <div className="product-total-quantity">

                  <span>
                    Total Stock
                  </span>

                  <strong>
                    {
                      product.quantity
                    }
                  </strong>

                </div>

              </button>

            )
          )}

        </div>

      </div>

    </div>
  );
}

export default DistributorStock;
