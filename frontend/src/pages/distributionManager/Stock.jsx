import { useEffect, useState } from "react";
import "./distributionManager.css";

const API_URL = "http://localhost:5000/api";

function MyStock() {

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token");

  async function loadStock() {

    try {

      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/stock/mine`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      setItems(
        data.stock?.items || []
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {
    loadStock();
  }, []);


  async function updateThreshold(
    productId,
    current
  ) {

    const value =
      prompt(
        "Enter low stock limit:",
        current
      );

    if (value === null) return;

    const threshold =
      Number(value);

    if (
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {

      alert(
        "Enter a valid non-negative number"
      );

      return;

    }

    try {

      const response =
        await fetch(
          `${API_URL}/stock/low-stock-threshold/${productId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify({
                threshold
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Unable to update limit"
        );

        return;

      }

      alert(
        "Low stock limit updated"
      );

      loadStock();

    } catch (error) {

      alert(
        "Server error"
      );

    }

  }


  const filteredItems =
    items.filter(item => {

      const name =
        item.product?.name
          ?.toLowerCase() || "";

      const sku =
        item.product?.sku
          ?.toLowerCase() || "";

      return (
        name.includes(
          search.toLowerCase()
        ) ||
        sku.includes(
          search.toLowerCase()
        )
      );

    });


  return (

    <div className="dm-page">

      <div className="dm-page-header">

        <div>

          <h1>
            My Stock
          </h1>

          <p>
            Manage your current inventory
          </p>

        </div>

      </div>


      <div className="dm-card">

        <div className="dm-toolbar">

          <input
            type="text"
            placeholder="Search product or SKU..."
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
            className="dm-search"
          />

          <button
            className="dm-secondary-btn"
            onClick={loadStock}
          >
            ↻ Refresh
          </button>

        </div>


        <div className="dm-table-wrapper">

          <table className="dm-table">

            <thead>

              <tr>

                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Low Stock Limit</th>
                <th>Stock Value</th>
                <th>Status</th>
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
                    Loading stock...
                  </td>

                </tr>

              ) : filteredItems.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="dm-empty"
                  >
                    No products found
                  </td>

                </tr>

              ) : (

                filteredItems.map(item => {

                  const quantity =
                    Number(
                      item.quantity || 0
                    );

                  const threshold =
                    Number(
                      item.lowStockThreshold || 0
                    );

                  const price =
                    Number(
                      item.product?.price || 0
                    );

                  let status =
                    "In Stock";

                  if (quantity === 0) {

                    status =
                      "Out of Stock";

                  } else if (
                    quantity <= threshold
                  ) {

                    status =
                      "Low Stock";

                  }

                  return (

                    <tr
                      key={item.product?._id}
                    >

                      <td>

                        <div className="dm-product-cell">

                          {item.product?.images?.[0] && (

                            <img
                              src={
                                item.product.images[0]
                              }
                              alt=""
                            />

                          )}

                          <span>
                            {item.product?.name}
                          </span>

                        </div>

                      </td>

                      <td>
                        {item.product?.sku || "-"}
                      </td>

                      <td>
                        <strong>
                          {quantity}
                        </strong>
                      </td>

                      <td>

                        <span>
                          {threshold}
                        </span>

                      </td>

                      <td>
                        ₹
                        {(
                          quantity * price
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>

                        <span
                          className={
                            `dm-status ${
                              status === "In Stock"
                                ? "success"
                                : status === "Low Stock"
                                ? "warning"
                                : "danger"
                            }`
                          }
                        >
                          {status}
                        </span>

                      </td>

                      <td>

                        <button
                          className="dm-small-btn"
                          onClick={() =>
                            updateThreshold(
                              item.product?._id,
                              threshold
                            )
                          }
                        >
                          Edit Limit
                        </button>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default MyStock;