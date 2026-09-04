import { useEffect, useState } from "react";
import "./distributionManager.css";

const API_URL = "http://localhost:5000/api";

function LowStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadLowStock();
  }, []);

  async function loadLowStock() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/stock/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        setProducts([]);
        return;
      }

      const items = data.stock?.items || [];

      // Sirf low-stock products
      const lowStockProducts = items
        .map((item) => {
          const quantity = Number(item.quantity || 0);

          const threshold = Number(
            item.lowStockThreshold || 0
          );

          const price = Number(
            item.product?.price || 0
          );

          const shortage =
            Math.max(threshold - quantity, 0);

          return {
            productId: item.product?._id,
            name: item.product?.name || "Unknown Product",
            sku: item.product?.sku || "-",
            images: item.product?.images || [],
            quantity,
            lowStockThreshold: threshold,
            shortage,
            stockValue: quantity * price
          };
        })
        .filter(
          (product) =>
            product.quantity <=
            product.lowStockThreshold
        );

      setProducts(lowStockProducts);

    } catch (error) {
      console.error(
        "Load low stock error:",
        error
      );

      setProducts([]);

    } finally {
      setLoading(false);
    }
  }

  async function editLimit(
    productId,
    current
  ) {
    const value = prompt(
      "Enter low stock limit:",
      current
    );

    if (value === null) return;

    const threshold = Number(value);

    if (
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      alert(
        "Enter a valid whole number"
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/stock/low-stock-threshold/${productId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            threshold
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to update"
        );
        return;
      }

      alert(
        "Low stock limit updated"
      );

      loadLowStock();

    } catch (error) {
      console.error(error);

      alert(
        "Server error"
      );
    }
  }

  function printPDF() {
    window.print();
  }

  return (
    <div className="dm-page">

      <div className="dm-page-header">

        <div>
          <h1>
            Low Stock
          </h1>

          <p>
            Products that need attention
          </p>
        </div>

        <button
          className="dm-primary-btn"
          onClick={printPDF}
        >
          📄 Download PDF
        </button>

      </div>


      <div className="dm-alert-banner">

        <div className="dm-alert-icon">
          ⚠️
        </div>

        <div>

          <strong>
            {products.length} products
            need attention
          </strong>

          <p>
            These products are at or below
            their configured stock limit.
          </p>

        </div>

      </div>


      <div className="dm-card">

        <div className="dm-table-wrapper">

          <table className="dm-table">

            <thead>

              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Limit</th>
                <th>Shortage</th>
                <th>Stock Value</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="dm-empty"
                  >
                    Loading...
                  </td>

                </tr>

              ) : products.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="dm-empty dm-success-empty"
                  >
                    🎉 No low stock products
                  </td>

                </tr>

              ) : (

                products.map((product) => (

                  <tr
                    key={product.productId}
                  >

                    <td>

                      <div className="dm-product-cell">

                        {product.images?.[0] && (
                          <img
                            src={
                              product.images[0]
                            }
                            alt=""
                          />
                        )}

                        <span>
                          {product.name}
                        </span>

                      </div>

                    </td>

                    <td>
                      {product.sku}
                    </td>

                    <td>

                      <strong className="dm-danger-text">
                        {product.quantity}
                      </strong>

                    </td>

                    <td>
                      {product.lowStockThreshold}
                    </td>

                    <td>

                      <span className="dm-shortage">
                        {product.shortage}
                      </span>

                    </td>

                    <td>
                      ₹
                      {Number(
                        product.stockValue || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>

                      <button
                        className="dm-small-btn"
                        onClick={() =>
                          editLimit(
                            product.productId,
                            product.lowStockThreshold
                          )
                        }
                      >
                        Edit Limit
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default LowStock;