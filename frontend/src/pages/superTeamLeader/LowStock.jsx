import { useEffect, useState } from "react";
import "./SuperTeamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

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
        `${API}/stock/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        setProducts([]);
        return;
      }

      const items = data.stock?.items || [];

      // MyStock ke same data se low-stock products nikalna
      const lowStock = items
        .map((item) => {
          const quantity = Number(item.quantity || 0);

          const lowStockThreshold = Number(
            item.lowStockThreshold || 0
          );

          const price = Number(
            item.product?.price || 0
          );

          return {
            productId: item.product?._id,
            name: item.product?.name || "-",
            sku: item.product?.sku || "-",
            quantity,
            lowStockThreshold,
            shortage: Math.max(
              lowStockThreshold - quantity,
              0
            ),
            stockValue: quantity * price,
          };
        })
        .filter(
          (product) =>
            product.quantity <=
            product.lowStockThreshold
        );

      setProducts(lowStock);

    } catch (error) {
      console.error(
        "Low stock loading error:",
        error
      );

      setProducts([]);

    } finally {
      setLoading(false);
    }
  }

  async function editLimit(product) {
    const value = window.prompt(
      `Set low stock limit for ${product.name}`,
      product.lowStockThreshold
    );

    if (value === null) return;

    const threshold = Number(value);

    if (
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      alert(
        "Please enter a valid whole number."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API}/stock/low-stock-threshold/${product.productId}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            threshold,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to update limit"
        );
        return;
      }

      alert(
        "Low stock limit updated."
      );

      loadLowStock();

    } catch (error) {
      console.error(error);

      alert(
        "Server error while updating limit."
      );
    }
  }

  function downloadPDF() {
    window.print();
  }

  if (loading) {
    return (
      <div className="stl-page">
        <div className="stl-loading">
          Loading low stock...
        </div>
      </div>
    );
  }

  return (
    <div className="stl-page">

      {/* HEADER */}

      <div className="stl-header">

        <div>
          <h1>Low Stock</h1>

          <p>
            Products that have reached their
            low stock limit.
          </p>
        </div>

        <button
          className="stl-btn primary"
          onClick={downloadPDF}
        >
          Download PDF
        </button>

      </div>


      {/* LOW STOCK SUMMARY */}

      <div className="stl-panel">

        <div
          style={{
            padding: "20px",
            fontWeight: "600",
          }}
        >
          ⚠️ {products.length} Low Stock Product
          {products.length !== 1 ? "s" : ""}
        </div>


        {/* TABLE */}

        <div className="stl-table-wrapper">

          <table className="stl-table">

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

              {products.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="stl-empty-cell"
                  >
                    🎉 No low stock products.
                  </td>

                </tr>

              ) : (

                products.map((product) => (

                  <tr
                    key={product.productId}
                  >

                    <td>
                      <strong>
                        {product.name}
                      </strong>
                    </td>

                    <td>
                      {product.sku}
                    </td>

                    <td>
                      <strong>
                        {product.quantity}
                      </strong>
                    </td>

                    <td>
                      {product.lowStockThreshold}
                    </td>

                    <td>
                      {product.shortage}
                    </td>

                    <td>
                      ₹
                      {Number(
                        product.stockValue || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>

                      <button
                        className="stl-btn"
                        onClick={() =>
                          editLimit(product)
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
