
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./ProductManagerDashboard.css";

function ProductManagerDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [productData, categoryData] = await Promise.all([
        api("/products"),
        api("/products/categories")
      ]);

      setProducts(productData.products || []);
      setCategories(categoryData.categories || []);

    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE"
  ).length;

  const inactiveProducts = products.filter(
    (product) => product.status === "INACTIVE"
  ).length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  );

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0);
    const threshold = Number(
      product.lowStockThreshold || 0
    );

    return (
      stock > 0 &&
      threshold > 0 &&
      stock <= threshold
    );
  });

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) === 0
  );

  if (loading) {
    return (
      <div className="pm-page">
        <div className="pm-loading">
          Loading Product Manager Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="pm-page">

      {/* HEADER */}

      <div className="pm-page-header">

        <div>
          <span className="pm-eyebrow">
            PRODUCT MANAGER
          </span>

          <h1>
            Product Dashboard
          </h1>

          <p>
            Manage products, categories and company
            inventory from one place.
          </p>
        </div>

        <button
          className="pm-primary-button"
          onClick={() =>
            navigate("/dashboard/product-manager/products")
          }
        >
          + Add Product
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="pm-alert error">
          {error}
        </div>
      )}


      {/* STAT CARDS */}

      <div className="pm-stat-grid">

        <div className="pm-stat-card">
          <div className="pm-stat-icon">
            📦
          </div>

          <div>
            <span>
              Total Products
            </span>

            <strong>
              {totalProducts}
            </strong>
          </div>
        </div>


        <div className="pm-stat-card">
          <div className="pm-stat-icon">
            ✓
          </div>

          <div>
            <span>
              Active Products
            </span>

            <strong>
              {activeProducts}
            </strong>
          </div>
        </div>


        <div className="pm-stat-card">
          <div className="pm-stat-icon">
            🏷️
          </div>

          <div>
            <span>
              Categories
            </span>

            <strong>
              {categories.length}
            </strong>
          </div>
        </div>


        <div className="pm-stat-card">
          <div className="pm-stat-icon">
            📊
          </div>

          <div>
            <span>
              Company Stock
            </span>

            <strong>
              {totalStock.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

      </div>


      {/* INVENTORY ALERTS */}

      <div className="pm-two-column">

        <div className="pm-card">

          <div className="pm-card-header">

            <div>
              <h2>
                Inventory Alerts
              </h2>

              <p>
                Products requiring attention.
              </p>
            </div>

            <button
              className="pm-outline-button"
              onClick={() =>
                navigate(
                  "/dashboard/product-manager/products"
                )
              }
            >
              View Products
            </button>

          </div>


          <div className="pm-alert-summary">

            <div className="pm-alert-box warning">
              <span>
                Low Stock
              </span>

              <strong>
                {lowStockProducts.length}
              </strong>
            </div>


            <div className="pm-alert-box danger">
              <span>
                Out of Stock
              </span>

              <strong>
                {outOfStockProducts.length}
              </strong>
            </div>


            <div className="pm-alert-box normal">
              <span>
                Inactive
              </span>

              <strong>
                {inactiveProducts}
              </strong>
            </div>

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div className="pm-card">

          <div className="pm-card-header">

            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Frequently used management pages.
              </p>
            </div>

          </div>


          <div className="pm-quick-actions">

            <button
              onClick={() =>
                navigate(
                  "/dashboard/product-manager/products"
                )
              }
            >
              <span>📦</span>
              <div>
                <strong>
                  Products
                </strong>
                <small>
                  Create and manage products
                </small>
              </div>
            </button>


            <button
              onClick={() =>
                navigate(
                  "/dashboard/product-manager/categories"
                )
              }
            >
              <span>🏷️</span>
              <div>
                <strong>
                  Categories
                </strong>
                <small>
                  Manage product categories
                </small>
              </div>
            </button>


            <button
              onClick={() =>
                navigate(
                  "/dashboard/product-manager/stock"
                )
              }
            >
              <span>📊</span>
              <div>
                <strong>
                  Stock
                </strong>
                <small>
                  View company inventory
                </small>
              </div>
            </button>


            <button
              onClick={() =>
                navigate(
                  "/dashboard/product-manager/reports"
                )
              }
            >
              <span>📈</span>
              <div>
                <strong>
                  Reports
                </strong>
                <small>
                  Review product reports
                </small>
              </div>
            </button>

          </div>

        </div>

      </div>


      {/* LOW STOCK PRODUCTS */}

      <div className="pm-card">

        <div className="pm-card-header">

          <div>
            <h2>
              Low Stock Products
            </h2>

            <p>
              Based on each product's own threshold.
            </p>
          </div>

        </div>


        {lowStockProducts.length === 0 ? (

          <div className="pm-empty small">
            <div>✓</div>

            <h3>
              No Low Stock Products
            </h3>

            <p>
              All products are currently above
              their configured thresholds.
            </p>
          </div>

        ) : (

          <div className="pm-table-wrapper">

            <table className="pm-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Low Stock At</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {lowStockProducts
                  .slice(0, 8)
                  .map((product) => (

                    <tr key={product._id}>

                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>

                      <td>
                        {product.sku || "-"}
                      </td>

                      <td>
                        <strong className="pm-stock-warning">
                          {product.stock}
                        </strong>
                      </td>

                      <td>
                        {product.lowStockThreshold}
                      </td>

                      <td>
                        <span className="pm-badge warning">
                          LOW STOCK
                        </span>
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default ProductManagerDashboard;
