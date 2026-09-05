import "./Cart.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch (error) {
      console.error("Cart loading error:", error);
      setCart([]);
    }
  }

  function saveCart(updatedCart) {
    setCart(updatedCart);
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  }

  function increaseQuantity(index) {
    const updatedCart = [...cart];

    const item = updatedCart[index];

    if (item.quantity >= Number(item.stock || 0)) {
      return;
    }

    item.quantity += 1;

    saveCart(updatedCart);
  }

  function decreaseQuantity(index) {
    const updatedCart = [...cart];

    const item = updatedCart[index];

    if (item.quantity <= 1) {
      return;
    }

    item.quantity -= 1;

    saveCart(updatedCart);
  }

  function removeItem(index) {
    const updatedCart = cart.filter(
      (_, i) => i !== index
    );

    saveCart(updatedCart);
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("cart");
  }

  const totalAmount = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  return (
    <div className="member-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <h1>My Cart</h1>

          <p>
            Review your selected products before checkout.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/dashboard/member/products")
          }
        >
          ← Products
        </button>

      </div>


      {/* =====================================
          EMPTY CART
      ===================================== */}

      {cart.length === 0 && (

        <div className="dashboard-card empty-network">

          <div className="empty-icon">
            🛒
          </div>

          <h2>
            Your Cart is Empty
          </h2>

          <p>
            You haven't added any products to your cart yet.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/dashboard/member/products")
            }
          >
            Browse Products
          </button>

        </div>

      )}


      {/* =====================================
          CART CONTENT
      ===================================== */}

      {cart.length > 0 && (

        <>

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h2>
                  Selected Products
                </h2>

                <p>
                  {cart.length} product
                  {cart.length !== 1 ? "s" : ""} in your cart.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={clearCart}
              >
                Clear Cart
              </button>

            </div>


            {/* =================================
                CART ITEMS
            ================================= */}

            <div className="cart-list">

              {cart.map((item, index) => {

                const itemTotal =
                  Number(item.price || 0) *
                  Number(item.quantity || 0);

                return (

                  <div
                    className="cart-item"
                    key={item._id || item.id || index}
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="cart-product-image">

                      {item.images?.length > 0 ? (

                        <img
                          src={item.images[0]}
                          alt={item.name}
                        />

                      ) : (

                        <span>
                          🛍️
                        </span>

                      )}

                    </div>


                    {/* PRODUCT INFO */}

                    <div className="cart-product-info">

                      <h3>
                        {item.name || "Product"}
                      </h3>

                      <p>
                        {item.description ||
                          "No description available"}
                      </p>

                      <strong>
                        ₹
                        {Number(
                          item.price || 0
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>


                    {/* QUANTITY */}

                    <div className="cart-quantity">

                      <span>
                        Quantity
                      </span>

                      <div className="quantity-controls">

                        <button
                          onClick={() =>
                            decreaseQuantity(index)
                          }
                        >
                          −
                        </button>

                        <strong>
                          {item.quantity}
                        </strong>

                        <button
                          onClick={() =>
                            increaseQuantity(index)
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>


                    {/* ITEM TOTAL */}

                    <div className="cart-item-total">

                      <span>
                        Total
                      </span>

                      <strong>
                        ₹
                        {itemTotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    {/* REMOVE */}

                    <button
                      className="remove-cart-button"
                      onClick={() =>
                        removeItem(index)
                      }
                    >
                      Remove
                    </button>

                  </div>

                );

              })}

            </div>

          </div>


          {/* =====================================
              CART SUMMARY
          ===================================== */}

          <div className="dashboard-card cart-summary">

            <div className="card-header">

              <div>
                <h2>
                  Order Summary
                </h2>

                <p>
                  Check your total before checkout.
                </p>
              </div>

            </div>


            <div className="cart-summary-row">

              <span>
                Products
              </span>

              <strong>
                {cart.reduce(
                  (total, item) =>
                    total +
                    Number(item.quantity || 0),
                  0
                )}
              </strong>

            </div>


            <div className="cart-summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            <div className="cart-summary-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            {/* CHECKOUT */}

            <button
              className="primary-button checkout-button"
              onClick={() =>
                navigate("/dashboard/member/checkout")
              }
            >
              Proceed to Checkout →
            </button>

          </div>

        </>

      )}

    </div>
  );
}

export default Cart;
