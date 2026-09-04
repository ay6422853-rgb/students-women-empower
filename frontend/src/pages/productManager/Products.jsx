
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./Product.css";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  sku: "",
  images: "",
  stock: "",
  lowStockThreshold: "",
  status: "ACTIVE"
};

function Products() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  useEffect(() => {
    loadData();
  }, []);


  async function loadData() {

    try {

      setLoading(true);
      setError("");

      const [
        productData,
        categoryData
      ] = await Promise.all([
        api("/products"),
        api("/products/categories")
      ]);

      setProducts(
        productData.products || []
      );

      setCategories(
        categoryData.categories || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load products."
      );

    } finally {

      setLoading(false);

    }
  }


  function handleChange(e) {

    const {
      name,
      value
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }


  function resetForm() {

    setForm(emptyForm);
    setEditingId(null);
  }


  function startEdit(product) {

    setEditingId(product._id);

    setForm({

      name:
        product.name || "",

      description:
        product.description || "",

      category:
        product.category?._id || "",

      price:
        product.price ?? "",

      sku:
        product.sku || "",

      images:
        product.images?.join(", ") || "",

      stock:
        product.stock ?? "",

      lowStockThreshold:
        product.lowStockThreshold ?? "",

      status:
        product.status || "ACTIVE"
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setMessage("");


    if (!form.name.trim()) {

      setError(
        "Product name is required."
      );

      return;
    }


    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {

      setError(
        "Please enter a valid price."
      );

      return;
    }


    if (
      form.stock !== "" &&
      Number(form.stock) < 0
    ) {

      setError(
        "Stock cannot be negative."
      );

      return;
    }


    if (
      form.lowStockThreshold !== "" &&
      Number(form.lowStockThreshold) < 0
    ) {

      setError(
        "Low stock threshold cannot be negative."
      );

      return;
    }


    try {

      setSaving(true);


      const images =
        form.images
          .split(",")
          .map((image) => image.trim())
          .filter(Boolean);


      const body = {

        name:
          form.name.trim(),

        description:
          form.description.trim(),

        category:
          form.category || undefined,

        price:
          Number(form.price),

        sku:
          form.sku.trim() || undefined,

        images,

        stock:
          Number(form.stock || 0),

        lowStockThreshold:
          Number(
            form.lowStockThreshold || 0
          ),

        status:
          form.status
      };


      if (editingId) {

        const data = await api(
          `/products/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify(body)
          }
        );


        setProducts((prev) =>
          prev.map((product) =>
            product._id === editingId
              ? data.product
              : product
          )
        );


        setMessage(
          "Product updated successfully."
        );

      } else {

        const data = await api(
          "/products",
          {
            method: "POST",
            body: JSON.stringify(body)
          }
        );


        setProducts((prev) => [
          data.product,
          ...prev
        ]);


        setMessage(
          "Product created successfully."
        );
      }


      resetForm();

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to save product."
      );

    } finally {

      setSaving(false);

    }
  }


  async function toggleStatus(product) {

    try {

      setError("");
      setMessage("");

      const newStatus =
        product.status === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";


      const data = await api(
        `/products/${product._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus
          })
        }
      );


      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? data.product
            : item
        )
      );


      setMessage(
        `Product marked ${newStatus}.`
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to update product status."
      );
    }
  }


  const filteredProducts =
    products.filter((product) => {

      const text =
        search.toLowerCase().trim();


      const matchesSearch =
        !text ||
        product.name
          ?.toLowerCase()
          .includes(text) ||
        product.sku
          ?.toLowerCase()
          .includes(text) ||
        product.category?.name
          ?.toLowerCase()
          .includes(text);


      const matchesFilter =
        filter === "ALL" ||
        product.status === filter;


      return (
        matchesSearch &&
        matchesFilter
      );
    });


  if (loading) {

    return (
      <div className="pm-page">

        <div className="pm-loading">
          Loading products...
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
            Products
          </h1>

          <p>
            Create, edit and manage your
            product catalogue.
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


      {/* ALERTS */}

      {error && (
        <div className="pm-alert error">
          {error}
        </div>
      )}


      {message && (
        <div className="pm-alert success">
          {message}
        </div>
      )}


      {/* FORM */}

      <div className="pm-card">

        <div className="pm-card-header">

          <div>

            <h2>
              {editingId
                ? "Edit Product"
                : "Add New Product"}
            </h2>

            <p>
              {editingId
                ? "Update product information."
                : "Add a new product to Empower."}
            </p>

          </div>


          {editingId && (

            <button
              className="pm-outline-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>

          )}

        </div>


        <form
          className="pm-form"
          onSubmit={handleSubmit}
        >

          <div className="pm-form-grid">

            {/* NAME */}

            <div className="pm-field full">

              <label>
                Product Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />

            </div>


            {/* CATEGORY */}

            <div className="pm-field">

              <label>
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (

                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* PRICE */}

            <div className="pm-field">

              <label>
                Price *
              </label>

              <input
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
              />

            </div>


            {/* SKU */}

            <div className="pm-field">

              <label>
                SKU
              </label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="SKU-001"
              />

            </div>


            {/* COMPANY STOCK */}

            <div className="pm-field">

              <label>
                Company Stock
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
              />

            </div>


            {/* LOW STOCK THRESHOLD */}

            <div className="pm-field">

              <label>
                Low Stock At
              </label>

              <input
                type="number"
                min="0"
                name="lowStockThreshold"
                value={
                  form.lowStockThreshold
                }
                onChange={handleChange}
                placeholder="Example: 100"
              />

              <small>
                Stock this value or below will
                be shown as Low Stock.
              </small>

            </div>


            {/* STATUS */}

            <div className="pm-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>

              </select>

            </div>


            {/* IMAGES */}

            <div className="pm-field full">

              <label>
                Image URLs
              </label>

              <input
                name="images"
                value={form.images}
                onChange={handleChange}
                placeholder="https://..., https://..."
              />

              <small>
                Multiple image URLs comma se
                separate karein.
              </small>

            </div>


            {/* DESCRIPTION */}

            <div className="pm-field full">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the product..."
              />

            </div>

          </div>


          <div className="pm-form-actions">

            <button
              type="button"
              className="pm-outline-button"
              onClick={resetForm}
            >
              Clear
            </button>

            <button
              type="submit"
              className="pm-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Create Product"}
            </button>

          </div>

        </form>

      </div>


      {/* PRODUCT LIST */}

      <div className="pm-card">

        <div className="pm-card-header">

          <div>

            <h2>
              Product Catalogue
            </h2>

            <p>
              {filteredProducts.length} product
              {filteredProducts.length !== 1
                ? "s"
                : ""} found.
            </p>

          </div>

        </div>


        {/* CONTROLS */}

        <div className="pm-controls">

          <div className="pm-search">

            🔎

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search product, SKU or category..."
            />

          </div>


          <div className="pm-filter-buttons">

            {[
              "ALL",
              "ACTIVE",
              "INACTIVE"
            ].map((value) => (

              <button
                key={value}
                className={
                  filter === value
                    ? "pm-filter active"
                    : "pm-filter"
                }
                onClick={() =>
                  setFilter(value)
                }
              >
                {value}
              </button>

            ))}

          </div>

        </div>


        {/* EMPTY */}

        {filteredProducts.length === 0 ? (

          <div className="pm-empty">

            <div>
              📦
            </div>

            <h3>
              No Products Found
            </h3>

            <p>
              Try another search or create
              a new product.
            </p>

          </div>

        ) : (

          <div className="pm-product-grid">

            {filteredProducts.map(
              (product) => {

                const stock =
                  Number(
                    product.stock || 0
                  );

                const threshold =
                  Number(
                    product.lowStockThreshold || 0
                  );


                const isOutOfStock =
                  stock === 0;

                const isLowStock =
                  !isOutOfStock &&
                  threshold > 0 &&
                  stock <= threshold;


                return (

                  <div
                    className="pm-product-card"
                    key={product._id}
                  >

                    <div className="pm-product-image">

                      {product.images?.length > 0 ? (

                        <img
                          src={
                            product.images[0]
                          }
                          alt={
                            product.name
                          }
                        />

                      ) : (

                        <span>
                          📦
                        </span>

                      )}

                    </div>


                    <div className="pm-product-content">

                      <div className="pm-product-top">

                        <span className="pm-category-tag">
                          {
                            product.category?.name ||
                            "Uncategorized"
                          }
                        </span>


                        <span
                          className={
                            product.status === "ACTIVE"
                              ? "pm-status active"
                              : "pm-status inactive"
                          }
                        >
                          {product.status}
                        </span>

                      </div>


                      <h3>
                        {product.name}
                      </h3>


                      <p>
                        {product.description ||
                          "No description available."}
                      </p>


                      <div className="pm-product-meta">

                        <strong>
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <span>
                          SKU:{" "}
                          {product.sku || "-"}
                        </span>

                      </div>


                      <div className="pm-product-stock">

                        <div>

                          <span>
                            Company Stock
                          </span>

                          <strong
                            className={
                              isOutOfStock
                                ? "danger"
                                : isLowStock
                                ? "warning"
                                : "normal"
                            }
                          >
                            {stock}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Low Stock At
                          </span>

                          <strong>
                            {threshold}
                          </strong>

                        </div>

                      </div>


                      {/* STOCK STATUS */}

                      {isOutOfStock && (

                        <span className="pm-stock-badge danger">
                          OUT OF STOCK
                        </span>

                      )}


                      {isLowStock && (

                        <span className="pm-stock-badge warning">
                          LOW STOCK
                        </span>

                      )}


                      {!isOutOfStock &&
                        !isLowStock && (

                          <span className="pm-stock-badge normal">
                            STOCK OK
                          </span>

                        )}


                      <div className="pm-product-actions">

                        <button
                          className="pm-outline-button"
                          onClick={() =>
                            startEdit(product)
                          }
                        >
                          Edit
                        </button>


                        <button
                          className={
                            product.status === "ACTIVE"
                              ? "pm-danger-button"
                              : "pm-success-button"
                          }
                          onClick={() =>
                            toggleStatus(product)
                          }
                        >
                          {product.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Products;
