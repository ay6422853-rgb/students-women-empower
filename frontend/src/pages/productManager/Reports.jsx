
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./ProductManager.css";

function Reports() {

  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadReports();
  }, []);


  async function loadReports() {

    try {

      setLoading(true);
      setError("");

      const data =
        await api("/products");

      setProducts(
        data.products || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load reports."
      );

    } finally {

      setLoading(false);

    }
  }


  const report = useMemo(() => {

    const totalProducts =
      products.length;

    const activeProducts =
      products.filter(
        (p) => p.status === "ACTIVE"
      ).length;

    const inactiveProducts =
      products.filter(
        (p) => p.status === "INACTIVE"
      ).length;

    const totalStock =
      products.reduce(
        (sum, p) =>
          sum +
          Number(p.stock || 0),
        0
      );

    const lowStockProducts =
      products.filter((p) => {

        const stock =
          Number(p.stock || 0);

        const threshold =
          Number(
            p.lowStockThreshold || 0
          );

        return (
          stock > 0 &&
          threshold > 0 &&
          stock <= threshold
        );
      });

    const outOfStockProducts =
      products.filter(
        (p) =>
          Number(p.stock || 0) === 0
      );


    const totalCatalogueValue =
      products.reduce(
        (sum, p) =>
          sum +
          Number(p.price || 0) *
          Number(p.stock || 0),
        0
      );


    return {

      totalProducts,

      activeProducts,

      inactiveProducts,

      totalStock,

      lowStockProducts,

      outOfStockProducts,

      totalCatalogueValue
    };

  }, [products]);


  if (loading) {

    return (
      <div className="pm-page">

        <div className="pm-loading">
          Generating reports...
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
            Reports
          </h1>

          <p>
            Overview of products, inventory and
            stock health.
          </p>

        </div>


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

      </div>


      {error && (
        <div className="pm-alert error">
          {error}
        </div>
      )}


      {/* SUMMARY */}

      <div className="pm-stat-grid">

        <div className="pm-stat-card">

          <div className="pm-stat-icon">
            📦
          </div>

          <div>

            <span>
              Products
            </span>

            <strong>
              {report.totalProducts}
            </strong>

          </div>

        </div>


        <div className="pm-stat-card">

          <div className="pm-stat-icon">
            ✓
          </div>

          <div>

            <span>
              Active
            </span>

            <strong>
              {report.activeProducts}
            </strong>

          </div>

        </div>


        <div className="pm-stat-card">

          <div className="pm-stat-icon">
            ⚠
          </div>

          <div>

            <span>
              Low Stock
            </span>

            <strong>
              {report.lowStockProducts.length}
            </strong>

          </div>

        </div>


        <div className="pm-stat-card">

          <div className="pm-stat-icon">
            📊
          </div>

          <div>

            <span>
              Total Stock
            </span>

            <strong>
              {report.totalStock.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* REPORT CARDS */}

      <div className="pm-two-column">

        {/* INVENTORY HEALTH */}

        <div className="pm-card">

          <div className="pm-card-header">

            <div>

              <h2>
                Inventory Health
              </h2>

              <p>
                Current stock condition.
              </p>

            </div>

          </div>


          <div className="pm-report-list">

            <div>

              <span>
                Total Company Stock
              </span>

              <strong>
                {report.totalStock.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            <div>

              <span>
                Low Stock Products
              </span>

              <strong className="pm-stock-warning">
                {report.lowStockProducts.length}
              </strong>

            </div>


            <div>

              <span>
                Out of Stock Products
              </span>

              <strong className="pm-stock-danger">
                {report.outOfStockProducts.length}
              </strong>

            </div>


            <div>

              <span>
                Inactive Products
              </span>

              <strong>
                {report.inactiveProducts}
              </strong>

            </div>

          </div>

        </div>


        {/* CATALOGUE VALUE */}

        <div className="pm-card">

          <div className="pm-card-header">

            <div>

              <h2>
                Catalogue Value
              </h2>

              <p>
                Current stock × product price.
              </p>

            </div>

          </div>


          <div className="pm-report-highlight">

            <span>
              Estimated Inventory Value
            </span>

            <strong>
              ₹
              {report.totalCatalogueValue.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          <p className="pm-report-note">
            This is the current catalogue value
            based on company stock and product
            price. It is not a sales report.
          </p>

        </div>

      </div>


      {/* LOW STOCK REPORT */}

      <div className="pm-card">

        <div className="pm-card-header">

          <div>

            <h2>
              Low Stock Report
            </h2>

            <p>
              Products below their own configured
              threshold.
            </p>

          </div>

        </div>


        {report.lowStockProducts.length === 0 ? (

          <div className="pm-empty small">

            <div>
              ✓
            </div>

            <h3>
              No Low Stock Products
            </h3>

            <p>
              All products are above their
              configured thresholds.
            </p>

          </div>

        ) : (

          <div className="pm-table-wrapper">

            <table className="pm-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Current Stock
                  </th>

                  <th>
                    Threshold
                  </th>

                  <th>
                    Difference
                  </th>

                </tr>

              </thead>


              <tbody>

                {report.lowStockProducts.map(
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


                    return (

                      <tr
                        key={product._id}
                      >

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
                            {stock}
                          </strong>
                        </td>

                        <td>
                          {threshold}
                        </td>

                        <td>
                          {threshold - stock}
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

export default Reports;

