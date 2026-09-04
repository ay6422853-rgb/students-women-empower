
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./ProductManager.css";

function Categories() {

  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  useEffect(() => {
    loadCategories();
  }, []);


  async function loadCategories() {

    try {

      setLoading(true);
      setError("");

      const data =
        await api("/products/categories");

      setCategories(
        data.categories || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load categories."
      );

    } finally {

      setLoading(false);

    }
  }


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setMessage("");


    if (!name.trim()) {

      setError(
        "Category name is required."
      );

      return;
    }


    try {

      setSaving(true);


      const data =
        await api(
          "/products/categories",
          {
            method: "POST",

            body: JSON.stringify({
              name:
                name.trim(),

              description:
                description.trim()
            })
          }
        );


      setCategories((prev) => [
        ...prev,
        data.category
      ].sort((a, b) =>
        a.name.localeCompare(b.name)
      ));


      setName("");
      setDescription("");

      setMessage(
        "Category created successfully."
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to create category."
      );

    } finally {

      setSaving(false);

    }
  }


  if (loading) {

    return (
      <div className="pm-page">

        <div className="pm-loading">
          Loading categories...
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
            Categories
          </h1>

          <p>
            Organize products into manageable
            categories.
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


      <div className="pm-two-column">

        {/* CREATE */}

        <div className="pm-card">

          <div className="pm-card-header">

            <div>

              <h2>
                Add Category
              </h2>

              <p>
                Create a category for products.
              </p>

            </div>

          </div>


          <form
            className="pm-form"
            onSubmit={handleSubmit}
          >

            <div className="pm-field">

              <label>
                Category Name *
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Example: Personal Care"
              />

            </div>


            <div className="pm-field">

              <label>
                Description
              </label>

              <textarea
                rows="5"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Category description..."
              />

            </div>


            <button
              type="submit"
              className="pm-primary-button"
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Category"}
            </button>

          </form>

        </div>


        {/* LIST */}

        <div className="pm-card">

          <div className="pm-card-header">

            <div>

              <h2>
                Category List
              </h2>

              <p>
                {categories.length} categories
                available.
              </p>

            </div>

          </div>


          {categories.length === 0 ? (

            <div className="pm-empty small">

              <div>
                🏷️
              </div>

              <h3>
                No Categories
              </h3>

              <p>
                Create your first category.
              </p>

            </div>

          ) : (

            <div className="pm-category-list">

              {categories.map(
                (category, index) => (

                  <div
                    className="pm-category-item"
                    key={category._id}
                  >

                    <div className="pm-category-number">
                      {index + 1}
                    </div>

                    <div>

                      <strong>
                        {category.name}
                      </strong>

                      <p>
                        {category.description ||
                          "No description"}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Categories;
