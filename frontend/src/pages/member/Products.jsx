import "./Products.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Products() {
  const navigate = useNavigate();

  // ==========================================
  // PRODUCTS
  // ==========================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // ==========================================
  // TEAM LEADERS
  // ==========================================

  const [teamLeaders, setTeamLeaders] = useState([]);
  const [selectedTeamLeader, setSelectedTeamLeader] = useState("");
  const [teamLeaderSearch, setTeamLeaderSearch] = useState("");
  const [showTeamLeaderDropdown, setShowTeamLeaderDropdown] =
    useState(false);

  // ==========================================
  // SELECTED TEAM LEADER STOCK
  // ==========================================

  const [teamLeaderStock, setTeamLeaderStock] = useState([]);

  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);

  // ==========================================
  // MESSAGE
  // ==========================================

  const [error, setError] = useState("");

  // ==========================================
  // SEARCH
  // ==========================================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // ==========================================
  // CART
  // ==========================================

  const [cart, setCart] = useState([]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadInitialData();

    const savedCart = localStorage.getItem("empower_cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error("Cart parse error:", error);
        setCart([]);
      }
    }
  }, []);

  // ==========================================
  // LOAD INITIAL DATA
  // ==========================================

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadTeamLeaders(),
      ]);
    } catch (error) {
      console.error("Initial products loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  async function loadProducts() {
    try {
      const data = await api("/products");

      setProducts(
        Array.isArray(data.products) ? data.products : []
      );
    } catch (error) {
      console.error("Products loading error:", error);

      setError(
        error.message || "Unable to load products."
      );
    }
  }

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  async function loadCategories() {
    try {
      const data = await api("/products/categories");

      setCategories(
        Array.isArray(data.categories) ? data.categories : []
      );
    } catch (error) {
      console.error("Categories loading error:", error);
    }
  }

  // ==========================================
  // LOAD TEAM LEADERS
  // ==========================================

  async function loadTeamLeaders() {
    try {
      const data = await api("/users/team-leaders");

      const leaders = Array.isArray(data.users)
        ? data.users
        : [];

      setTeamLeaders(leaders);

      // Restore seller from cart
      const savedCart =
        localStorage.getItem("empower_cart");

      let savedTeamLeader = "";

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);

          if (
            Array.isArray(parsedCart) &&
            parsedCart.length > 0
          ) {
            savedTeamLeader =
              parsedCart[0]?.teamLeaderId || "";
          }
        } catch {
          savedTeamLeader = "";
        }
      }

      if (
        savedTeamLeader &&
        leaders.some(
          (leader) =>
            String(leader._id) ===
            String(savedTeamLeader)
        )
      ) {
        setSelectedTeamLeader(savedTeamLeader);
        loadTeamLeaderStock(savedTeamLeader);
      }
    } catch (error) {
      console.error(
        "Team Leaders loading error:",
        error
      );

      setTeamLeaders([]);

      setError(
        error.message ||
          "Unable to load Team Leaders."
      );
    }
  }

  // ==========================================
  // FILTER TEAM LEADERS
  // ==========================================

  const filteredTeamLeaders = useMemo(() => {
    const text = teamLeaderSearch
      .toLowerCase()
      .trim();

    if (!text) {
      return teamLeaders;
    }

    return teamLeaders.filter((leader) => {
      return (
        leader.name
          ?.toLowerCase()
          .includes(text) ||
        leader.city
          ?.toLowerCase()
          .includes(text) ||
        leader.district
          ?.toLowerCase()
          .includes(text) ||
        leader.state
          ?.toLowerCase()
          .includes(text) ||
        leader.email
          ?.toLowerCase()
          .includes(text) ||
        String(leader.phone || "")
          .toLowerCase()
          .includes(text) ||
        String(leader.pincode || "")
          .toLowerCase()
          .includes(text) ||
        leader.referralCode
          ?.toLowerCase()
          .includes(text)
      );
    });
  }, [teamLeaders, teamLeaderSearch]);

  // ==========================================
  // LOAD TEAM LEADER STOCK
  // ==========================================

  async function loadTeamLeaderStock(teamLeaderId) {
    if (!teamLeaderId) {
      setTeamLeaderStock([]);
      return;
    }

    try {
      setStockLoading(true);
      setError("");

      const data = await api(
        `/stock/team-leader/${teamLeaderId}`
      );

      setTeamLeaderStock(
        data.stock?.items || []
      );
    } catch (error) {
      console.error(
        "Team Leader stock error:",
        error
      );

      setTeamLeaderStock([]);

      setError(
        error.message ||
          "Unable to load Team Leader stock."
      );
    } finally {
      setStockLoading(false);
    }
  }

  // ==========================================
  // SELECT TEAM LEADER
  // ==========================================

  async function handleTeamLeaderChange(teamLeaderId) {
    setSelectedTeamLeader(teamLeaderId);
    setTeamLeaderSearch("");
    setShowTeamLeaderDropdown(false);
    setError("");

    if (!teamLeaderId) {
      setTeamLeaderStock([]);
      saveCart([]);
      return;
    }

    // Seller change = clear old seller cart
    saveCart([]);

    await loadTeamLeaderStock(teamLeaderId);
  }

  // ==========================================
  // SAVE CART
  // ==========================================

  function saveCart(updatedCart) {
    setCart(updatedCart);

    localStorage.setItem(
      "empower_cart",
      JSON.stringify(updatedCart)
    );
  }

  // ==========================================
  // GET TEAM LEADER STOCK
  // ==========================================

  function getTeamLeaderStock(productId) {
    const stockItem = teamLeaderStock.find(
      (item) =>
        String(item.product?._id) ===
        String(productId)
    );

    return Number(stockItem?.quantity || 0);
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  function addToCart(product) {
    if (!selectedTeamLeader) {
      setError(
        "Please select a Team Leader first."
      );
      return;
    }

    const availableStock =
      getTeamLeaderStock(product._id);

    if (availableStock <= 0) {
      setError(
        `${product.name} is currently out of stock with this Team Leader.`
      );
      return;
    }

    const existing = cart.find(
      (item) =>
        String(item.productId) ===
        String(product._id)
    );

    let updatedCart;

    if (existing) {
      if (
        Number(existing.quantity) >=
        availableStock
      ) {
        return;
      }

      updatedCart = cart.map((item) =>
        String(item.productId) ===
        String(product._id)
          ? {
              ...item,
              quantity:
                Number(item.quantity) + 1,
              stock: availableStock,
              teamLeaderId:
                selectedTeamLeader,
            }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: Number(product.price || 0),
          image: product.images?.[0] || "",
          quantity: 1,
          stock: availableStock,
          teamLeaderId: selectedTeamLeader,
        },
      ];
    }

    setError("");
    saveCart(updatedCart);
  }

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  function increaseQuantity(productId) {
    const availableStock =
      getTeamLeaderStock(productId);

    const item = cart.find(
      (item) =>
        String(item.productId) ===
        String(productId)
    );

    if (!item) {
      return;
    }

    if (
      Number(item.quantity) >=
      availableStock
    ) {
      return;
    }

    const updatedCart = cart.map((item) =>
      String(item.productId) ===
      String(productId)
        ? {
            ...item,
            quantity:
              Number(item.quantity) + 1,
            stock: availableStock,
          }
        : item
    );

    saveCart(updatedCart);
  }

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  function decreaseQuantity(productId) {
    const item = cart.find(
      (item) =>
        String(item.productId) ===
        String(productId)
    );

    if (!item) {
      return;
    }

    if (Number(item.quantity) <= 1) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map((item) =>
      String(item.productId) ===
      String(productId)
        ? {
            ...item,
            quantity:
              Number(item.quantity) - 1,
          }
        : item
    );

    saveCart(updatedCart);
  }

  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  function removeFromCart(productId) {
    const updatedCart = cart.filter(
      (item) =>
        String(item.productId) !==
        String(productId)
    );

    saveCart(updatedCart);
  }

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !text ||
        product.name
          ?.toLowerCase()
          .includes(text) ||
        product.description
          ?.toLowerCase()
          .includes(text) ||
        product.sku
          ?.toLowerCase()
          .includes(text);

      const categoryId =
        product.category?._id ||
        product.category;

      const matchesCategory =
        selectedCategory === "ALL" ||
        String(categoryId) ===
          String(selectedCategory);

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    selectedCategory,
  ]);

  // ==========================================
  // CART COUNT
  // ==========================================

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  // ==========================================
  // CART TOTAL
  // ==========================================

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  // ==========================================
  // SELECTED LEADER
  // ==========================================

  const selectedLeader =
    teamLeaders.find(
      (leader) =>
        String(leader._id) ===
        String(selectedTeamLeader)
    );

  // ==========================================
  // PROCEED CHECKOUT
  // ==========================================

  function proceedToCheckout() {
    setError("");

    if (!selectedTeamLeader) {
      setError(
        "Please select a Team Leader."
      );
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    const invalidCart = cart.some(
      (item) =>
        String(item.teamLeaderId) !==
        String(selectedTeamLeader)
    );

    if (invalidCart) {
      setError(
        "Your cart contains products from another Team Leader. Please clear the cart and try again."
      );
      return;
    }

    navigate(
      "/dashboard/member/checkout"
    );
  }

  // ==========================================
  // RETRY
  // ==========================================

  async function retry() {
    setError("");

    await loadInitialData();

    if (selectedTeamLeader) {
      await loadTeamLeaderStock(
        selectedTeamLeader
      );
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="member-page products-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="page-header products-header">
        <div>
          <div className="page-eyebrow">
            MEMBER SHOP
          </div>

          <h1>Products</h1>

          <p>
            Select your Team Leader and
            shop available products.
          </p>
        </div>

        <button
          className="cart-button"
          onClick={() =>
            document
              .getElementById("empower-cart")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
          }
        >
          <span className="cart-icon">
            🛒
          </span>

          <span>Cart</span>

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="network-message error-message">
          <span>{error}</span>

          <button
            className="retry-button"
            onClick={retry}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================
          TEAM LEADER SELECTOR
      ====================================== */}

      <div className="dashboard-card seller-card">

        <div className="card-header">
          <div>
            <span className="section-label">
              STEP 01
            </span>

            <h2>
              Select Team Leader
            </h2>

            <p>
              Products and stock will be
              shown from your selected
              Team Leader.
            </p>
          </div>

          <div className="seller-header-icon">
            👤
          </div>
        </div>

        <div className="form-group">
          <label>
            Team Leader <span>*</span>
          </label>

          <div className="team-leader-search-wrapper">

            <div className="team-leader-search-box">
              <span className="team-leader-search-icon">
                🔎
              </span>

              <input
                type="text"
                className="team-leader-search"
                placeholder={
                  selectedLeader
                    ? selectedLeader.name
                    : "Search by name, city, phone..."
                }
                value={teamLeaderSearch}
                onChange={(e) => {
                  setTeamLeaderSearch(
                    e.target.value
                  );

                  setShowTeamLeaderDropdown(
                    true
                  );
                }}
                onFocus={() =>
                  setShowTeamLeaderDropdown(
                    true
                  )
                }
                disabled={stockLoading}
              />

              {teamLeaderSearch && (
                <button
                  type="button"
                  className="team-leader-search-clear"
                  onClick={() => {
                    setTeamLeaderSearch("");
                    setShowTeamLeaderDropdown(
                      true
                    );
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {showTeamLeaderDropdown && (
              <div className="team-leader-dropdown">

                <button
                  type="button"
                  className="team-leader-option team-leader-clear-option"
                  onClick={() =>
                    handleTeamLeaderChange("")
                  }
                >
                  <strong>
                    Select Team Leader
                  </strong>
                </button>

                {filteredTeamLeaders.length > 0 ? (
                  filteredTeamLeaders.map(
                    (leader) => (
                      <button
                        type="button"
                        key={leader._id}
                        className={
                          String(
                            selectedTeamLeader
                          ) ===
                          String(
                            leader._id
                          )
                            ? "team-leader-option selected"
                            : "team-leader-option"
                        }
                        onClick={() =>
                          handleTeamLeaderChange(
                            leader._id
                          )
                        }
                      >
                        <div className="team-leader-option-main">
                          <strong>
                            {leader.name}
                          </strong>

                          {String(
                            selectedTeamLeader
                          ) ===
                            String(
                              leader._id
                            ) && (
                            <span className="team-leader-selected-icon">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="team-leader-option-details">
                          {leader.city && (
                            <span>
                              📍 {leader.city}
                            </span>
                          )}

                          {leader.district &&
                            leader.district !==
                              leader.city && (
                              <span>
                                {leader.district}
                              </span>
                            )}

                          {leader.phone && (
                            <span>
                              📞 {leader.phone}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  )
                ) : (
                  <div className="team-leader-no-result">
                    No Team Leader found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedLeader && (
          <div className="selected-seller-box">
            <div className="selected-seller-icon">
              ✓
            </div>

            <div>
              <span>
                Selected Team Leader
              </span>

              <strong>
                {selectedLeader.name}
              </strong>

              {(selectedLeader.city ||
                selectedLeader.district) && (
                <small>
                  📍{" "}
                  {[
                    selectedLeader.city,
                    selectedLeader.district,
                  ]
                    .filter(Boolean)
                    .filter(
                      (value, index, arr) =>
                        arr.indexOf(value) ===
                        index
                    )
                    .join(", ")}
                </small>
              )}
            </div>
          </div>
        )}

        {!loading &&
          teamLeaders.length === 0 && (
            <div className="network-message">
              No active Team Leader is
              available right now.
            </div>
          )}
      </div>

      {/* ======================================
          SEARCH + CATEGORY
      ====================================== */}

      <div className="dashboard-card product-controls">

        <div className="product-search">
          <span>🔎</span>

          <input
            type="text"
            placeholder="Search products, SKU..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() =>
                setSearch("")
              }
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-list">

          <button
            className={
              selectedCategory === "ALL"
                ? "category-button active"
                : "category-button"
            }
            onClick={() =>
              setSelectedCategory("ALL")
            }
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              className={
                selectedCategory ===
                category._id
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() =>
                setSelectedCategory(
                  category._id
                )
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && (
        <div className="dashboard-card product-loading">
          <div className="loading-spinner"></div>
          <span>Loading products...</span>
        </div>
      )}

      {/* ======================================
          STOCK LOADING
      ====================================== */}

      {!loading &&
        selectedTeamLeader &&
        stockLoading && (
          <div className="dashboard-card product-loading">
            <div className="loading-spinner"></div>
            <span>
              Loading Team Leader stock...
            </span>
          </div>
        )}

      {/* ======================================
          NO TEAM LEADER
      ====================================== */}

      {!loading &&
        !selectedTeamLeader && (
          <div className="dashboard-card empty-network">

            <div className="empty-icon">
              👥
            </div>

            <h2>
              Select a Team Leader
            </h2>

            <p>
              Please select a Team Leader
              above to see available
              products and stock.
            </p>
          </div>
        )}

      {/* ======================================
          NO PRODUCTS
      ====================================== */}

      {!loading &&
        selectedTeamLeader &&
        !stockLoading &&
        filteredProducts.length === 0 && (
          <div className="dashboard-card empty-network">

            <div className="empty-icon">
              🛍️
            </div>

            <h2>
              No Products Found
            </h2>

            <p>
              No products match your
              current search or category.
            </p>

            <button
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setSelectedCategory(
                  "ALL"
                );
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

      {/* ======================================
          PRODUCTS GRID
      ====================================== */}

      {!loading &&
        selectedTeamLeader &&
        !stockLoading &&
        filteredProducts.length > 0 && (
          <div className="products-grid">

            {filteredProducts.map(
              (product) => {
                const availableStock =
                  getTeamLeaderStock(
                    product._id
                  );

                const cartItem =
                  cart.find(
                    (item) =>
                      String(
                        item.productId
                      ) ===
                      String(
                        product._id
                      )
                  );

                const quantity = Number(
                  cartItem?.quantity || 0
                );

                const outOfStock =
                  availableStock <= 0 ||
                  product.status !==
                    "ACTIVE";

                return (
                  <div
                    className="product-card"
                    key={product._id}
                  >

                    <div className="product-image">

                      {product.images?.length >
                      0 ? (
                        <img
                          src={
                            product.images[0]
                          }
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="no-product-image">
                          🛍️
                        </div>
                      )}

                      <span
                        className={
                          outOfStock
                            ? "stock-badge out"
                            : "stock-badge"
                        }
                      >
                        {outOfStock
                          ? "Out of Stock"
                          : `${availableStock} in stock`}
                      </span>
                    </div>

                    <div className="product-details">

                      <div className="product-category">
                        {product.category?.name ||
                          "General"}
                      </div>

                      <h3>
                        {product.name}
                      </h3>

                      <p className="product-description">
                        {product.description ||
                          "No description available."}
                      </p>

                      <div className="product-bottom">

                        <strong className="product-price">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        {product.sku && (
                          <span className="product-sku">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>

                      {quantity === 0 ? (
                        <button
                          className="add-cart-button"
                          disabled={
                            outOfStock ||
                            !selectedTeamLeader
                          }
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          {outOfStock
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                      ) : (
                        <div className="quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                product._id
                              )
                            }
                          >
                            −
                          </button>

                          <strong>
                            {quantity}
                          </strong>

                          <button
                            type="button"
                            disabled={
                              quantity >=
                              availableStock
                            }
                            onClick={() =>
                              increaseQuantity(
                                product._id
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      {/* ======================================
          SHOPPING CART
      ====================================== */}

      <div
        id="empower-cart"
        className="dashboard-card cart-section"
      >

        <div className="card-header cart-header">

          <div>
            <span className="section-label">
              STEP 02
            </span>

            <h2>
              Shopping Cart
            </h2>

            <p>
              {cartCount} item
              {cartCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="cart-header-total">
            ₹
            {cartTotal.toLocaleString(
              "en-IN"
            )}
          </div>
        </div>

        {/* EMPTY CART */}

        {cart.length === 0 ? (
          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h3>
              Your cart is empty
            </h3>

            <p>
              Add products to your cart
              to continue.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-list">

              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={item.productId}
                >

                  <div className="cart-product-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>

                  <div className="cart-item-info">

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="cart-quantity">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          item.productId
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {item.quantity}
                    </strong>

                    <button
                      type="button"
                      disabled={
                        Number(
                          item.quantity
                        ) >=
                        getTeamLeaderStock(
                          item.productId
                        )
                      }
                      onClick={() =>
                        increaseQuantity(
                          item.productId
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <strong className="cart-item-total">
                    ₹
                    {(
                      Number(
                        item.price || 0
                      ) *
                      Number(
                        item.quantity || 0
                      )
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
                    type="button"
                    className="remove-cart"
                    onClick={() =>
                      removeFromCart(
                        item.productId
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">

              <div className="cart-total-row">
                <span>
                  Cart Total
                </span>

                <strong>
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <button
                className="checkout-button"
                onClick={
                  proceedToCheckout
                }
              >
                Proceed to Checkout
                <span>→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Products;