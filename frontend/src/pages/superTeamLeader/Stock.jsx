import { useEffect, useState } from "react";
import "./SuperTeamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

function MyStock() {

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [threshold, setThreshold] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadStock();
  }, []);

  async function loadStock() {

    try {

      const response = await fetch(
        `${API}/stock/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setItems(data.stock?.items || []);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  async function updateLimit(productId) {

    const value = Number(threshold);

    if (!Number.isInteger(value) || value < 0) {
      alert("Enter a valid non-negative whole number.");
      return;
    }

    try {

      const response = await fetch(
        `${API}/stock/low-stock-threshold/${productId}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            threshold: value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update limit");
        return;
      }

      alert("Low stock limit updated.");

      setEditingId(null);

      setThreshold("");

      loadStock();

    } catch (error) {

      console.error(error);

      alert("Server error while updating limit.");

    }
  }

  const filtered = items.filter((item) => {

    const name =
      item.product?.name?.toLowerCase() || "";

    const sku =
      item.product?.sku?.toLowerCase() || "";

    const text = search.toLowerCase();

    return (
      name.includes(text) ||
      sku.includes(text)
    );

  });

  if (loading) {
    return (
      <div className="stl-page">
        <div className="stl-loading">
          Loading stock...
        </div>
      </div>
    );
  }

  return (
    <div className="stl-page">

      <div className="stl-header">
        <div>
          <h1>My Stock</h1>
          <p>Manage your available stock.</p>
        </div>
      </div>

      <div className="stl-toolbar">

        <input
          type="text"
          placeholder="Search product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="stl-search"
        />

      </div>

      <div className="stl-panel">

        <div className="stl-table-wrapper">

          <table className="stl-table">

            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Low Limit</th>
                <th>Stock Value</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((item) => {

                const quantity =
                  Number(item.quantity || 0);

                const limit =
                  Number(item.lowStockThreshold || 0);

                const price =
                  Number(item.product?.price || 0);

                let status = "IN STOCK";

                if (quantity === 0) {
                  status = "OUT OF STOCK";
                } else if (quantity <= limit) {
                  status = "LOW STOCK";
                }

                return (
                  <tr key={item.product?._id}>

                    <td>
                      <strong>
                        {item.product?.name || "-"}
                      </strong>
                    </td>

                    <td>
                      {item.product?.sku || "-"}
                    </td>

                    <td>
                      {quantity}
                    </td>

                    <td>

                      {editingId === item.product?._id ? (
                        <input
                          type="number"
                          min="0"
                          value={threshold}
                          onChange={(e) =>
                            setThreshold(e.target.value)
                          }
                          className="stl-limit-input"
                        />
                      ) : (
                        limit
                      )}

                    </td>

                    <td>
                      ₹{(
                        quantity * price
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`stl-status ${status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>

                      {editingId === item.product?._id ? (
                        <div className="stl-actions">

                          <button
                            className="stl-btn primary"
                            onClick={() =>
                              updateLimit(
                                item.product._id
                              )
                            }
                          >
                            Save
                          </button>

                          <button
                            className="stl-btn"
                            onClick={() => {
                              setEditingId(null);
                              setThreshold("");
                            }}
                          >
                            Cancel
                          </button>

                        </div>
                      ) : (
                        <button
                          className="stl-btn"
                          onClick={() => {
                            setEditingId(item.product._id);
                            setThreshold(limit);
                          }}
                        >
                          Edit Limit
                        </button>
                      )}

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default MyStock;
