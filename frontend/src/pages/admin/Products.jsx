
import React, { useEffect, useMemo, useState } from "react";
import "./AdminProducts.css";

const API = "http://localhost:5000/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");

  const [selectedIds, setSelectedIds] = useState([]);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ---------------------------------------------
  // LOAD PRODUCTS
  // ---------------------------------------------

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/admin/products`, {
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load products"
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || data.data || []
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // LOAD SHORTLISTED PRODUCTS
  // ---------------------------------------------

  const loadShortlisted = async () => {
    /*
      IMPORTANT:

      Agar aapke backend me product shortlist ke liye
      alag endpoint hai to yahan use connect kar sakte hain.

      Filhaal localStorage ko fallback ke roop me use
      kiya gaya hai taaki UI immediately kaam kare.
    */

    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            "adminShortlistedProducts"
          )
        ) || [];

      setShortlisted(saved);
    } catch {
      setShortlisted([]);
    }
  };

  useEffect(() => {
    loadProducts();
    loadShortlisted();
  }, []);

  // ---------------------------------------------
  // PRODUCT VALUES
  // ---------------------------------------------

  const getStock = (product) =>
    Number(
      product.stock ??
        product.quantity ??
        product.availableQuantity ??
        product.currentStock ??
        0
    );

  const getPrice = (product) =>
    Number(
      product.price ??
        product.sellingPrice ??
        0
    );

  const getCategory = (product) =>
    product.category?.name ||
    product.category ||
    "Uncategorized";

  const getStatus = (product) =>
    product.status || "ACTIVE";

  // ---------------------------------------------
  // SHORTLIST CHECK
  // ---------------------------------------------

  const isShortlisted = (id) => {
    return shortlisted.includes(String(id));
  };

  // ---------------------------------------------
  // CATEGORIES
  // ---------------------------------------------

  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map((product) =>
          getCategory(product)
        )
      ),
    ].sort();
  }, [products]);

  // ---------------------------------------------
  // FILTER + SORT
  // ---------------------------------------------

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = search
      .trim()
      .toLowerCase();

    if (query) {
      result = result.filter((product) => {
        const text = [
          product.name,
          product.sku,
          getCategory(product),
          product.description,
          product.brand,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      });
    }

    if (categoryFilter) {
      result = result.filter(
        (product) =>
          getCategory(product) ===
          categoryFilter
      );
    }

    if (statusFilter) {
      result = result.filter(
        (product) =>
          getStatus(product) ===
          statusFilter
      );
    }

    // STOCK FILTERS

    if (stockFilter === "OUT_OF_STOCK") {
      result = result.filter(
        (product) => getStock(product) <= 0
      );
    }

    if (stockFilter === "LOW_STOCK") {
      result = result.filter((product) => {
        const stock = getStock(product);
        return stock > 0 && stock <= 20;
      });
    }

    if (stockFilter === "GOOD_STOCK") {
      result = result.filter(
        (product) => getStock(product) > 20
      );
    }

    if (stockFilter === "HIGH_STOCK") {
      result = result.filter(
        (product) => getStock(product) >= 100
      );
    }

    if (stockFilter === "SHORTLISTED") {
      result = result.filter((product) =>
        isShortlisted(product._id)
      );
    }

    if (stockFilter === "NOT_SHORTLISTED") {
      result = result.filter(
        (product) =>
          !isShortlisted(product._id)
      );
    }

    // SORTING

    if (sortBy === "STOCK_HIGH") {
      result.sort(
        (a, b) =>
          getStock(b) - getStock(a)
      );
    }

    if (sortBy === "STOCK_LOW") {
      result.sort(
        (a, b) =>
          getStock(a) - getStock(b)
      );
    }

    if (sortBy === "PRICE_HIGH") {
      result.sort(
        (a, b) =>
          getPrice(b) - getPrice(a)
      );
    }

    if (sortBy === "PRICE_LOW") {
      result.sort(
        (a, b) =>
          getPrice(a) - getPrice(b)
      );
    }

    if (sortBy === "NAME") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    return result;
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
    stockFilter,
    sortBy,
    shortlisted,
  ]);

  // ---------------------------------------------
  // SELECT PRODUCT
  // ---------------------------------------------

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(
      filteredProducts.map(
        (product) => product._id
      )
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // ---------------------------------------------
  // SHORTLIST PRODUCT
  // ---------------------------------------------

  const toggleShortlist = (product) => {
    const id = String(product._id);

    let updated;

    if (isShortlisted(id)) {
      updated = shortlisted.filter(
        (item) => item !== id
      );
    } else {
      updated = [...shortlisted, id];
    }

    setShortlisted(updated);

    localStorage.setItem(
      "adminShortlistedProducts",
      JSON.stringify(updated)
    );
  };

  // ---------------------------------------------
  // BULK SHORTLIST
  // ---------------------------------------------

  const bulkShortlist = () => {
    if (!selectedIds.length) {
      alert("Please select products first.");
      return;
    }

    const updated = [
      ...new Set([
        ...shortlisted,
        ...selectedIds.map(String),
      ]),
    ];

    setShortlisted(updated);

    localStorage.setItem(
      "adminShortlistedProducts",
      JSON.stringify(updated)
    );

    setSelectedIds([]);

    alert(
      `${selectedIds.length} products shortlisted.`
    );
  };

  // ---------------------------------------------
  // SUMMARY
  // ---------------------------------------------

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + getStock(product),
    0
  );

  const lowStock = products.filter(
    (product) => {
      const stock = getStock(product);
      return stock > 0 && stock <= 20;
    }
  ).length;

  const outOfStock = products.filter(
    (product) => getStock(product) <= 0
  ).length;

  const highStock = products.filter(
    (product) => getStock(product) >= 100
  ).length;

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

  if (loading) {
    return (
      <div className="ap-loading">
        Loading products...
      </div>
    );
  }

  return (
    <div className="ap-page">

      {/* HEADER */}

      <div className="ap-header">

        <div>
          <h1>Product Management</h1>

          <p>
            Monitor products, stock quantity and
            shortlist products for priority
            management.
          </p>
        </div>

        <button
          className="ap-refresh"
          onClick={loadProducts}
        >
          ↻ Refresh
        </button>

      </div>

      {/* SUMMARY */}

      <div className="ap-summary">

        <div className="ap-stat">
          <span>Total Products</span>
          <strong>{totalProducts}</strong>
        </div>

        <div className="ap-stat">
          <span>Total Stock Quantity</span>
          <strong>
            {totalStock.toLocaleString()}
          </strong>
        </div>

        <div className="ap-stat">
          <span>High Stock</span>
          <strong>{highStock}</strong>
        </div>

        <div className="ap-stat warning">
          <span>Low Stock</span>
          <strong>{lowStock}</strong>
        </div>

        <div className="ap-stat danger">
          <span>Out of Stock</span>
          <strong>{outOfStock}</strong>
        </div>

        <div className="ap-stat selected">
          <span>Shortlisted</span>
          <strong>
            {shortlisted.length}
          </strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="ap-filter-card">

        <input
          type="text"
          placeholder="Search product, SKU, brand..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">
            All Status
          </option>

          <option value="ACTIVE">
            ACTIVE
          </option>

          <option value="INACTIVE">
            INACTIVE
          </option>

          <option value="DISCONTINUED">
            DISCONTINUED
          </option>
        </select>

        <select
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value)
          }
        >
          <option value="ALL">
            All Stock
          </option>

          <option value="HIGH_STOCK">
            High Stock (100+)
          </option>

          <option value="GOOD_STOCK">
            Good Stock (21+)
          </option>

          <option value="LOW_STOCK">
            Low Stock (1-20)
          </option>

          <option value="OUT_OF_STOCK">
            Out of Stock
          </option>

          <option value="SHORTLISTED">
            Shortlisted
          </option>

          <option value="NOT_SHORTLISTED">
            Not Shortlisted
          </option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="DEFAULT">
            Default Order
          </option>

          <option value="STOCK_HIGH">
            Quantity: High → Low
          </option>

          <option value="STOCK_LOW">
            Quantity: Low → High
          </option>

          <option value="PRICE_HIGH">
            Price: High → Low
          </option>

          <option value="PRICE_LOW">
            Price: Low → High
          </option>

          <option value="NAME">
            Name A → Z
          </option>
        </select>

      </div>

      {/* BULK ACTIONS */}

      <div className="ap-actions">

        <button
          onClick={selectAll}
          className="ap-action"
        >
          Select All
        </button>

        <button
          onClick={clearSelection}
          className="ap-action"
        >
          Clear
        </button>

        <button
          onClick={bulkShortlist}
          className="ap-action primary"
        >
          ★ Shortlist Selected (
          {selectedIds.length})
        </button>

        <span className="ap-result-count">
          Showing {filteredProducts.length} of{" "}
          {totalProducts} products
        </span>

      </div>

      {/* TABLE */}

      <div className="ap-table-card">

        <div className="ap-table-scroll">

          <table>

            <thead>

              <tr>

                <th>
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedIds.length ===
                        filteredProducts.length
                    }
                    onChange={(e) =>
                      e.target.checked
                        ? selectAll()
                        : clearSelection()
                    }
                  />
                </th>

                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Shortlist</th>

              </tr>

            </thead>

            <tbody>

              {filteredProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="ap-no-data"
                  >
                    No products found.
                  </td>

                </tr>

              ) : (

                filteredProducts.map(
                  (product) => {

                    const stock =
                      getStock(product);

                    const shortlistedProduct =
                      isShortlisted(
                        product._id
                      );

                    return (

                      <tr
                        key={product._id}
                      >

                        <td>

                          <input
                            type="checkbox"
                            checked={selectedIds.includes(
                              product._id
                            )}
                            onChange={() =>
                              toggleSelect(
                                product._id
                              )
                            }
                          />

                        </td>

                        <td>

                          <div className="ap-product">

                            <strong>
                              {product.name ||
                                "Unnamed Product"}
                            </strong>

                            {product.brand && (
                              <small>
                                {product.brand}
                              </small>
                            )}

                          </div>

                        </td>

                        <td>
                          {product.sku || "-"}
                        </td>

                        <td>
                          {getCategory(product)}
                        </td>

                        <td>
                          ₹
                          {getPrice(
                            product
                          ).toLocaleString()}
                        </td>

                        <td>

                          <strong>
                            {stock.toLocaleString()}
                          </strong>

                        </td>

                        <td>

                          {stock <= 0 ? (

                            <span className="ap-stock out">
                              OUT OF STOCK
                            </span>

                          ) : stock <= 20 ? (

                            <span className="ap-stock low">
                              LOW
                            </span>

                          ) : stock >= 100 ? (

                            <span className="ap-stock high">
                              HIGH
                            </span>

                          ) : (

                            <span className="ap-stock good">
                              GOOD
                            </span>

                          )}

                        </td>

                        <td>

                          <span className="ap-status">
                            {getStatus(product)}
                          </span>

                        </td>

                        <td>

                          <button
                            className={
                              shortlistedProduct
                                ? "ap-star active"
                                : "ap-star"
                            }
                            onClick={() =>
                              toggleShortlist(
                                product
                              )
                            }
                            title={
                              shortlistedProduct
                                ? "Remove shortlist"
                                : "Shortlist product"
                            }
                          >
                            {shortlistedProduct
                              ? "★"
                              : "☆"}
                          </button>

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

export default Products;
