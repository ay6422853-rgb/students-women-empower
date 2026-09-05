import React, { useEffect, useState } from "react";
import "./teamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

function Stock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  async function loadStock() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/stock/team-leader`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("TEAM LEADER STOCK RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load stock"
        );
      }

      // Backend response:
      // {
      //   stock: {
      //     owner: "...",
      //     items: [...]
      //   }
      // }

      const items = Array.isArray(data.stock?.items)
        ? data.stock.items
        : [];

      setStock(items);

    } catch (err) {
      console.error("Stock loading error:", err);
      setError(err.message || "Unable to load stock");
      setStock([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStock();
  }, []);

  const filteredStock = stock.filter((item) => {
    const product = item.product || {};

    const text = `
      ${product.name || ""}
      ${product.sku || ""}
      ${item.productName || ""}
      ${item.sku || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const totalQuantity = stock.reduce(
    (total, item) =>
      total +
      Number(
        item.quantity ||
        item.stock ||
        0
      ),
    0
  );

  return (
    <div className="tl-page">

      {/* HEADER */}
      <div className="tl-page-header">

        <div>
          <h1>My Stock</h1>

          <p>
            Stock available with your Team Leader account
          </p>
        </div>

        <div className="tl-count-badge">
          {totalQuantity} Units
        </div>

      </div>


      {/* ERROR */}
      {error && (
        <div className="tl-error">
          {error}
        </div>
      )}


      {/* TOOLBAR */}
      <div className="tl-toolbar">

        <input
          type="text"
          placeholder="Search product or SKU..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button
          className="tl-btn secondary"
          onClick={loadStock}
        >
          Refresh
        </button>

      </div>


      {/* LOADING */}
      {loading ? (

        <div className="tl-loading">
          Loading stock...
        </div>

      ) : filteredStock.length === 0 ? (

        <div className="tl-empty">

          {stock.length === 0
            ? "No stock has been assigned to you yet."
            : "No product matches your search."}

        </div>

      ) : (

        <div className="tl-table-wrapper">

          <table className="tl-table">

            <thead>

              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Low Limit</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {filteredStock.map(
                (item, index) => {

                  const product =
                    item.product || {};

                  const quantity =
                    Number(
                      item.quantity ||
                      item.stock ||
                      0
                    );

                  const lowLimit =
                    Number(
                      item.lowStockThreshold ||
                      item.lowLimit ||
                      0
                    );

                  const low =
                    lowLimit > 0 &&
                    quantity <= lowLimit;

                  return (

                    <tr
                      key={
                        item._id ||
                        product._id ||
                        index
                      }
                    >

                      <td>
                        <strong>
                          {product.name ||
                            item.productName ||
                            "Product"}
                        </strong>
                      </td>

                      <td>
                        {product.sku ||
                          item.sku ||
                          "-"}
                      </td>

                      <td>
                        <strong>
                          {quantity}
                        </strong>
                      </td>

                      <td>
                        {lowLimit || "-"}
                      </td>

                      <td>

                        <span
                          className={`tl-status ${
                            low
                              ? "pending"
                              : "active"
                          }`}
                        >
                          {low
                            ? "LOW STOCK"
                            : "IN STOCK"}
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
  );
}

export default Stock;
