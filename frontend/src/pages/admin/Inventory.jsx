import React, { useEffect, useMemo, useState } from "react";
import "./Inventory.css";

const API = "http://localhost:5000/api";

function Inventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("STOCK_VALUE_HIGH");

  const [selectedManager, setSelectedManager] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState([]);

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // LOAD INVENTORY
  // --------------------------------------------------

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API}/stock/distribution-managers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message || "Failed to load inventory"
        );
      }

      const managers = Array.isArray(result)
        ? result
        : result.distributionManagers ||
          result.data ||
          [];

      setData(managers);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getName = (manager) =>
    manager.name ||
    manager.user?.name ||
    manager.owner?.name ||
    manager.userId?.name ||
    "-";

  const getPhone = (manager) =>
    manager.phone ||
    manager.user?.phone ||
    manager.owner?.phone ||
    manager.userId?.phone ||
    "-";

  const getRole = (manager) =>
    manager.role ||
    manager.user?.role ||
    manager.owner?.role ||
    "DISTRIBUTION_MANAGER";

  const getCity = (manager) =>
    manager.city ||
    manager.user?.city ||
    manager.owner?.city ||
    "-";

  const getDistrict = (manager) =>
    manager.district ||
    manager.user?.district ||
    manager.owner?.district ||
    "-";

  // --------------------------------------------------
  // TOTAL QUANTITY
  // --------------------------------------------------

  const getQuantity = (manager) => {
    if (
      manager.totalQuantity !== undefined &&
      manager.totalQuantity !== null
    ) {
      return Number(manager.totalQuantity);
    }

    if (
      manager.totalStock !== undefined &&
      manager.totalStock !== null
    ) {
      return Number(manager.totalStock);
    }

    if (
      manager.quantity !== undefined &&
      manager.quantity !== null
    ) {
      return Number(manager.quantity);
    }

    if (Array.isArray(manager.items)) {
      return manager.items.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity ||
              item.stock ||
              item.availableQuantity ||
              0
          ),
        0
      );
    }

    if (Array.isArray(manager.stock)) {
      return manager.stock.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity ||
              item.stock ||
              item.availableQuantity ||
              0
          ),
        0
      );
    }

    return 0;
  };

  // --------------------------------------------------
  // STOCK VALUE
  // --------------------------------------------------

  const getStockValue = (manager) => {
    // If backend already provides calculated value
    if (
      manager.stockValue !== undefined &&
      manager.stockValue !== null
    ) {
      return Number(manager.stockValue);
    }

    if (
      manager.inventoryValue !== undefined &&
      manager.inventoryValue !== null
    ) {
      return Number(manager.inventoryValue);
    }

    if (
      manager.totalStockValue !== undefined &&
      manager.totalStockValue !== null
    ) {
      return Number(manager.totalStockValue);
    }

    // Calculate from items
    const items =
      manager.items ||
      manager.stock ||
      manager.products ||
      [];

    if (Array.isArray(items)) {
      return items.reduce((sum, item) => {
        const quantity = Number(
          item.quantity ||
            item.stock ||
            item.availableQuantity ||
            0
        );

        const price = Number(
          item.costPrice ??
            item.purchasePrice ??
            item.price ??
            item.sellingPrice ??
            item.product?.costPrice ??
            item.product?.purchasePrice ??
            item.product?.price ??
            item.product?.sellingPrice ??
            0
        );

        return sum + quantity * price;
      }, 0);
    }

    // If only total quantity + price exists
    const quantity = getQuantity(manager);

    const price = Number(
      manager.costPrice ??
        manager.purchasePrice ??
        manager.price ??
        manager.sellingPrice ??
        0
    );

    return quantity * price;
  };

  // --------------------------------------------------
  // STOCK STATUS
  // --------------------------------------------------

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return "OUT_OF_STOCK";
    if (quantity <= 20) return "LOW_STOCK";
    if (quantity <= 100) return "NORMAL";
    return "HIGH_STOCK";
  };

  // --------------------------------------------------
  // FILTER + SORT
  // --------------------------------------------------

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((manager) => {
        const text = [
          getName(manager),
          getPhone(manager),
          getRole(manager),
          getCity(manager),
          getDistrict(manager),
          manager.pincode,
          manager.user?.pincode,
          manager.owner?.pincode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(q);
      });
    }

    // Role filter
    if (roleFilter !== "ALL") {
      result = result.filter(
        (manager) =>
          String(getRole(manager)).toUpperCase() ===
          roleFilter
      );
    }

    // Stock filter
    if (stockFilter !== "ALL") {
      result = result.filter((manager) => {
        const quantity = getQuantity(manager);
        const status = getStockStatus(quantity);

        return status === stockFilter;
      });
    }

    // Sorting
    result.sort((a, b) => {
      const quantityA = getQuantity(a);
      const quantityB = getQuantity(b);

      const valueA = getStockValue(a);
      const valueB = getStockValue(b);

      const nameA = getName(a).toLowerCase();
      const nameB = getName(b).toLowerCase();

      if (sortBy === "STOCK_VALUE_HIGH") {
        return valueB - valueA;
      }

      if (sortBy === "STOCK_VALUE_LOW") {
        return valueA - valueB;
      }

      if (sortBy === "QUANTITY_HIGH") {
        return quantityB - quantityA;
      }

      if (sortBy === "QUANTITY_LOW") {
        return quantityA - quantityB;
      }

      if (sortBy === "NAME") {
        return nameA.localeCompare(nameB);
      }

      return 0;
    });

    return result;
  }, [
    data,
    search,
    roleFilter,
    stockFilter,
    sortBy,
  ]);

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const summary = useMemo(() => {
    const totalUsers = data.length;

    const totalQuantity = data.reduce(
      (sum, manager) => sum + getQuantity(manager),
      0
    );

    const totalValue = data.reduce(
      (sum, manager) => sum + getStockValue(manager),
      0
    );

    const lowStockUsers = data.filter(
      (manager) =>
        getStockStatus(getQuantity(manager)) ===
        "LOW_STOCK"
    ).length;

    const outOfStockUsers = data.filter(
      (manager) =>
        getStockStatus(getQuantity(manager)) ===
        "OUT_OF_STOCK"
    ).length;

    const highStockUsers = data.filter(
      (manager) =>
        getStockStatus(getQuantity(manager)) ===
        "HIGH_STOCK"
    ).length;

    return {
      totalUsers,
      totalQuantity,
      totalValue,
      lowStockUsers,
      outOfStockUsers,
      highStockUsers,
    };
  }, [data]);

  // --------------------------------------------------
  // VIEW USER STOCK
  // --------------------------------------------------

  const viewStock = async (manager) => {
    setSelectedManager(manager);
    setDetailsLoading(true);

    try {
      const userId =
        manager._id ||
        manager.user?._id ||
        manager.owner?._id ||
        manager.userId?._id ||
        manager.userId;

      // First use already available items
      const existingItems =
        manager.items ||
        manager.stock ||
        manager.products;

      if (Array.isArray(existingItems)) {
        setDetails(existingItems);
        setDetailsLoading(false);
        return;
      }

      // Try backend stock details endpoint
      const res = await fetch(
        `${API}/stock/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message || "Failed to load stock details"
        );
      }

      setDetails(
        Array.isArray(result)
          ? result
          : result.stock ||
              result.items ||
              result.products ||
              result.data ||
              []
      );
    } catch (error) {
      console.error(error);
      setDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedManager(null);
    setDetails([]);
  };

  // --------------------------------------------------
  // FORMAT MONEY
  // --------------------------------------------------

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="inventory-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="inventory-page">

      {/* HEADER */}
      <div className="inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p>
            Monitor user-wise stock quantity, stock value
            and inventory performance.
          </p>
        </div>

        <button
          className="inventory-btn secondary"
          onClick={loadInventory}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="inventory-summary">

        <div className="inventory-card">
          <span>Total Users</span>
          <strong>{summary.totalUsers}</strong>
        </div>

        <div className="inventory-card">
          <span>Total Stock Quantity</span>
          <strong>
            {summary.totalQuantity.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="inventory-card value-card">
          <span>Total Stock Value</span>
          <strong>{money(summary.totalValue)}</strong>
        </div>

        <div className="inventory-card">
          <span>High Stock Users</span>
          <strong>{summary.highStockUsers}</strong>
        </div>

        <div className="inventory-card warning-card">
          <span>Low Stock Users</span>
          <strong>{summary.lowStockUsers}</strong>
        </div>

        <div className="inventory-card danger-card">
          <span>Out of Stock</span>
          <strong>{summary.outOfStockUsers}</strong>
        </div>

      </div>

      {/* FILTERS */}
      <div className="inventory-filter-box">

        <div className="inventory-search">
          <input
            type="text"
            placeholder="Search name, phone, city, district..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
        >
          <option value="ALL">All Roles</option>
          <option value="MEMBER">Member</option>
          <option value="TEAM_LEADER">
            Team Leader
          </option>
          <option value="SUPER_TEAM_LEADER">
            Super Team Leader
          </option>
          <option value="CHIEF_TEAM_OFFICER">
            Chief Team Officer
          </option>
          <option value="PRODUCT_MANAGER">
            Product Manager
          </option>
          <option value="CASH_MANAGER">
            Cash Manager
          </option>
          <option value="DISTRIBUTION_MANAGER">
            Distribution Manager
          </option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">
            Super Admin
          </option>
        </select>

        <select
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value)
          }
        >
          <option value="ALL">All Stock</option>
          <option value="HIGH_STOCK">
            High Stock
          </option>
          <option value="NORMAL">
            Normal Stock
          </option>
          <option value="LOW_STOCK">
            Low Stock
          </option>
          <option value="OUT_OF_STOCK">
            Out of Stock
          </option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="STOCK_VALUE_HIGH">
            Stock Value: High → Low
          </option>

          <option value="STOCK_VALUE_LOW">
            Stock Value: Low → High
          </option>

          <option value="QUANTITY_HIGH">
            Quantity: High → Low
          </option>

          <option value="QUANTITY_LOW">
            Quantity: Low → High
          </option>

          <option value="NAME">
            Name A → Z
          </option>
        </select>

        <button
          className="inventory-btn reset"
          onClick={() => {
            setSearch("");
            setRoleFilter("ALL");
            setStockFilter("ALL");
            setSortBy("STOCK_VALUE_HIGH");
          }}
        >
          Reset
        </button>

      </div>

      {/* RESULT INFO */}
      <div className="inventory-result-info">
        Showing <strong>{filteredData.length}</strong>{" "}
        of <strong>{data.length}</strong> users
      </div>

      {/* TABLE */}
      <div className="inventory-table-wrapper">

        <table className="inventory-table">

          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Role</th>
              <th>Location</th>
              <th>Stock Qty</th>
              <th>Stock Value</th>
              <th>Stock Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="inventory-no-data"
                >
                  No inventory found.
                </td>
              </tr>
            ) : (
              filteredData.map((manager, index) => {

                const quantity =
                  getQuantity(manager);

                const value =
                  getStockValue(manager);

                const status =
                  getStockStatus(quantity);

                return (
                  <tr key={manager._id || index}>

                    <td>{index + 1}</td>

                    <td>
                      <div className="inventory-user">

                        <div className="inventory-avatar">
                          {getName(manager)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getName(manager)}
                          </strong>

                          <small>
                            {getPhone(manager)}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="role-badge">
                        {getRole(manager)}
                      </span>
                    </td>

                    <td>
                      <div>
                        {getCity(manager)}
                        <small>
                          {getDistrict(manager) !== "-"
                            ? `, ${getDistrict(manager)}`
                            : ""}
                        </small>
                      </div>
                    </td>

                    <td>
                      <strong>
                        {quantity.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </td>

                    <td>
                      <strong className="stock-value">
                        {money(value)}
                      </strong>
                    </td>

                    <td>

                      {status === "HIGH_STOCK" && (
                        <span className="stock-badge high">
                          High Stock
                        </span>
                      )}

                      {status === "NORMAL" && (
                        <span className="stock-badge normal">
                          Normal
                        </span>
                      )}

                      {status === "LOW_STOCK" && (
                        <span className="stock-badge low">
                          Low Stock
                        </span>
                      )}

                      {status === "OUT_OF_STOCK" && (
                        <span className="stock-badge out">
                          Out of Stock
                        </span>
                      )}

                    </td>

                    <td>
                      <button
                        className="inventory-btn small"
                        onClick={() =>
                          viewStock(manager)
                        }
                      >
                        View Stock
                      </button>
                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

      {/* DETAILS MODAL */}

      {selectedManager && (
        <div
          className="inventory-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="inventory-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="inventory-modal-header">

              <div>
                <h2>
                  {getName(selectedManager)}
                </h2>

                <p>
                  {getRole(selectedManager)} •{" "}
                  {getPhone(selectedManager)}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>

            <div className="manager-stock-summary">

              <div>
                <span>Total Quantity</span>
                <strong>
                  {getQuantity(
                    selectedManager
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Stock Value</span>
                <strong>
                  {money(
                    getStockValue(
                      selectedManager
                    )
                  )}
                </strong>
              </div>

            </div>

            <h3>Product-wise Stock</h3>

            {detailsLoading ? (
              <div className="details-loading">
                Loading stock details...
              </div>
            ) : details.length === 0 ? (
              <div className="details-empty">
                No product-wise stock data available.
              </div>
            ) : (
              <div className="details-table-wrapper">

                <table className="details-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>

                  <tbody>

                    {details.map(
                      (item, index) => {

                        const quantity =
                          Number(
                            item.quantity ||
                              item.stock ||
                              item.availableQuantity ||
                              0
                          );

                        const price =
                          Number(
                            item.costPrice ??
                              item.purchasePrice ??
                              item.price ??
                              item.sellingPrice ??
                              item.product
                                ?.costPrice ??
                              item.product
                                ?.purchasePrice ??
                              item.product
                                ?.price ??
                              item.product
                                ?.sellingPrice ??
                              0
                          );

                        const value =
                          quantity * price;

                        const productName =
                          item.product?.name ||
                          item.name ||
                          item.productName ||
                          "-";

                        const sku =
                          item.product?.sku ||
                          item.sku ||
                          "-";

                        return (
                          <tr
                            key={
                              item._id ||
                              index
                            }
                          >

                            <td>
                              <strong>
                                {productName}
                              </strong>
                            </td>

                            <td>{sku}</td>

                            <td>
                              {quantity.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              {money(price)}
                            </td>

                            <td>
                              <strong>
                                {money(value)}
                              </strong>
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
      )}

    </div>
  );
}

export default Inventory;