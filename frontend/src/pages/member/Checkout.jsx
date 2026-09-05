import "./Checkout.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

function Checkout() {
  const navigate = useNavigate();
  const teamLeaderDropdownRef = useRef(null);

  const [cart, setCart] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("");

  const [teamLeaderSearch, setTeamLeaderSearch] = useState("");
  const [showTeamLeaderDropdown, setShowTeamLeaderDropdown] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD CHECKOUT
  // ==========================================

  useEffect(() => {
    loadCheckout();
  }, []);

  // ==========================================
  // CLOSE TEAM LEADER DROPDOWN
  // ==========================================

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        teamLeaderDropdownRef.current &&
        !teamLeaderDropdownRef.current.contains(event.target)
      ) {
        setShowTeamLeaderDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ==========================================
  // LOAD CART + TEAM LEADERS
  // ==========================================

  async function loadCheckout() {
    try {
      setLoading(true);
      setError("");

      // ======================================
      // LOAD CART
      // ======================================

      const savedCart =
        localStorage.getItem("empower_cart");

      let parsedCart = [];

      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);

          parsedCart =
            Array.isArray(parsed)
              ? parsed
              : [];
        } catch {
          parsedCart = [];
        }
      }

      // ======================================
      // LOAD TEAM LEADERS
      // ======================================

      const data =
        await api("/users/team-leaders");

      setTeamLeaders(
        data.users || []
      );

      // ======================================
      // CART
      // ======================================

      setCart(parsedCart);
    } catch (err) {
      console.error(
        "Checkout loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FILTER TEAM LEADERS
  // ==========================================

  const filteredTeamLeaders = useMemo(() => {
    const text =
      teamLeaderSearch
        .toLowerCase()
        .trim();

    if (!text) {
      return teamLeaders;
    }

    return teamLeaders.filter(
      (leader) =>
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

        leader.phone
          ?.toLowerCase()
          .includes(text) ||

        leader.pincode
          ?.toLowerCase()
          .includes(text) ||

        leader.referralCode
          ?.toLowerCase()
          .includes(text)
    );
  }, [
    teamLeaders,
    teamLeaderSearch
  ]);

  // ==========================================
  // SELECT TEAM LEADER
  // ==========================================

  function handleTeamLeaderChange(teamLeaderId) {
    setSelectedSeller(teamLeaderId);
    setTeamLeaderSearch("");
    setShowTeamLeaderDropdown(false);
    setError("");
  }

  // ==========================================
  // SELECTED TEAM LEADER
  // ==========================================

  const selectedTeamLeader = useMemo(() => {
    return teamLeaders.find(
      (leader) =>
        String(leader._id) ===
        String(selectedSeller)
    );
  }, [
    teamLeaders,
    selectedSeller
  ]);

  // ==========================================
  // CART COUNT
  // ==========================================

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );
  }, [cart]);

  // ==========================================
  // CART TOTAL
  // ==========================================

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(
          item.price || 0
        ) *
        Number(
          item.quantity || 0
        ),
      0
    );
  }, [cart]);

  // ==========================================
  // UPDATE CART
  // ==========================================

  function saveCart(updatedCart) {
    setCart(updatedCart);

    localStorage.setItem(
      "empower_cart",
      JSON.stringify(updatedCart)
    );
  }

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  function removeItem(productId) {
    const updatedCart =
      cart.filter(
        (item) =>
          item.productId !==
          productId
      );

    saveCart(updatedCart);
  }

  // ==========================================
  // INCREASE
  // ==========================================

  function increaseQuantity(productId) {
    const updatedCart =
      cart.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        const stock =
          Number(
            item.stock || 0
          );

        if (
          item.quantity >=
          stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1
        };
      });

    saveCart(updatedCart);
  }

  // ==========================================
  // DECREASE
  // ==========================================

  function decreaseQuantity(productId) {
    const item =
      cart.find(
        (item) =>
          item.productId ===
          productId
      );

    if (!item) {
      return;
    }

    if (
      Number(item.quantity) <= 1
    ) {
      removeItem(productId);
      return;
    }

    const updatedCart =
      cart.map((item) =>
        item.productId ===
        productId
          ? {
              ...item,
              quantity:
                item.quantity - 1
            }
          : item
      );

    saveCart(updatedCart);
  }

  // ==========================================
  // PLACE ORDER
  // ==========================================

  async function placeOrder(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    // ======================================
    // CART CHECK
    // ======================================

    if (!cart.length) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    // ======================================
    // TEAM LEADER CHECK
    // ======================================

    if (!selectedSeller) {
      setError(
        "Please select a Team Leader."
      );

      return;
    }

    // ======================================
    // CHECK CART STOCK
    // ======================================

    const invalidItem =
      cart.find(
        (item) =>
          Number(
            item.quantity || 0
          ) >
          Number(
            item.stock || 0
          )
      );

    if (invalidItem) {
      setError(
        `${invalidItem.name} has only ${invalidItem.stock} item(s) available.`
      );

      return;
    }

    try {
      setPlacingOrder(true);

      // ====================================
      // PREPARE ITEMS
      // ====================================

      const items =
        cart.map((item) => ({
          product:
            item.productId,

          quantity:
            Number(
              item.quantity
            )
        }));

      // ====================================
      // CREATE ORDER
      // ====================================

      const data =
        await api(
          "/orders",
          {
            method: "POST",

            body:
              JSON.stringify({
                seller:
                  selectedSeller,

                items
              })
          }
        );

      console.log(
        "Order created:",
        data
      );

      // ====================================
      // CLEAR CART
      // ====================================

      localStorage.removeItem(
        "empower_cart"
      );

      setCart([]);

      // ====================================
      // SUCCESS
      // ====================================

      setMessage(
        "Order placed successfully. Please give the cash to the selected Team Leader."
      );

      // ====================================
      // GO ORDERS
      // ====================================

      setTimeout(() => {
        navigate(
          "/dashboard/member/orders"
        );
      }, 1500);
    } catch (err) {
      console.error(
        "Place order error:",
        err
      );

      setError(
        err.message ||
        "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (
    !loading &&
    cart.length === 0
  ) {
    return (
      <div className="member-page checkout-page">

        <div className="page-header">
          <div>
            <h1>
              Checkout
            </h1>

            <p>
              Complete your order.
            </p>
          </div>
        </div>

        <div className="dashboard-card empty-network">

          <div className="empty-icon">
            🛒
          </div>

          <h2>
            Your Cart Is Empty
          </h2>

          <p>
            Please add products before
            proceeding to checkout.
          </p>

          <button
            className="secondary-button"
            onClick={() =>
              navigate(
                "/dashboard/member/products"
              )
            }
          >
            Browse Products
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="member-page checkout-page">

        <div className="dashboard-card product-loading">
          Loading checkout...
        </div>

      </div>
    );
  }

  // ==========================================
  // CHECKOUT
  // ==========================================

  return (
    <div className="member-page checkout-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <h1>
            Checkout
          </h1>

          <p>
            Review your order and
            select your Team Leader.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate(
              "/dashboard/member/products"
            )
          }
        >
          ← Back to Products
        </button>

      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="network-message error-message">
          {error}
        </div>
      )}

      {/* =====================================
          SUCCESS
      ===================================== */}

      {message && (
        <div className="network-message success-message">
          {message}
        </div>
      )}

      <div className="checkout-grid">

        {/* ==================================
            LEFT
        ================================== */}

        <div>

          {/* ==================================
              ORDER SUMMARY
          ================================== */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Order Summary
                </h2>

                <p>
                  {cartCount} item
                  {cartCount !== 1
                    ? "s"
                    : ""}
                </p>

              </div>

            </div>

            <div className="checkout-items">

              {cart.map(
                (item) => (

                  <div
                    className="checkout-item"
                    key={
                      item.productId
                    }
                  >

                    {/* IMAGE */}

                    <div className="checkout-product-image">

                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                        />
                      ) : (
                        <div>
                          🛍️
                        </div>
                      )}

                    </div>

                    {/* INFO */}

                    <div className="checkout-product-info">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        ₹
                        {Number(
                          item.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}

                        {" × "}

                        {item.quantity}
                      </p>

                      <small>
                        Team Leader Stock:
                        {" "}
                        {item.stock}
                      </small>

                    </div>

                    {/* TOTAL */}

                    <strong>
                      ₹
                      {(
                        Number(
                          item.price ||
                            0
                        ) *
                        Number(
                          item.quantity ||
                            0
                        )
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    {/* REMOVE */}

                    <button
                      className="remove-cart"
                      onClick={() =>
                        removeItem(
                          item.productId
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                )
              )}

            </div>

            {/* TOTAL */}

            <div className="checkout-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {cartTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

          {/* ==================================
              TEAM LEADER
          ================================== */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Select Team Leader
                </h2>

                <p>
                  Select the Team Leader
                  from whom you want to
                  purchase the products.
                </p>

              </div>

            </div>

            <div className="form-group">

              <label>
                Team Leader *
              </label>

              {/* =================================
                  SEARCHABLE TEAM LEADER SELECTOR
              ================================= */}

              <div
                className="team-leader-search-wrapper"
                ref={
                  teamLeaderDropdownRef
                }
              >

                {/* SELECTED TEAM LEADER */}

                {selectedTeamLeader ? (
                  <div className="selected-team-leader">

                    <div className="selected-team-leader-info">

                      <div className="team-leader-avatar">
                        {selectedTeamLeader.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "T"}
                      </div>

                      <div>

                        <strong>
                          {
                            selectedTeamLeader.name
                          }
                        </strong>

                        <span>
                          {[
                            selectedTeamLeader.city,
                            selectedTeamLeader.district,
                            selectedTeamLeader.state
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                            "Location not available"}
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="team-leader-change-button"
                      onClick={() => {
                        setSelectedSeller("");
                        setTeamLeaderSearch("");
                        setShowTeamLeaderDropdown(
                          true
                        );
                      }}
                    >
                      Change
                    </button>

                  </div>
                ) : (
                  <>
                    {/* SEARCH BOX */}

                    <div className="team-leader-search-box">

                      <span className="team-leader-search-icon">
                        🔍
                      </span>

                      <input
                        type="text"
                        className="team-leader-search"
                        placeholder="Search Team Leader by name, city, phone..."
                        value={
                          teamLeaderSearch
                        }
                        onFocus={() =>
                          setShowTeamLeaderDropdown(
                            true
                          )
                        }
                        onChange={(e) => {
                          setTeamLeaderSearch(
                            e.target.value
                          );

                          setShowTeamLeaderDropdown(
                            true
                          );
                        }}
                      />

                      {teamLeaderSearch && (
                        <button
                          type="button"
                          className="team-leader-search-clear"
                          onClick={() => {
                            setTeamLeaderSearch(
                              ""
                            );

                            setShowTeamLeaderDropdown(
                              true
                            );
                          }}
                        >
                          ×
                        </button>
                      )}

                    </div>

                    {/* DROPDOWN */}

                    {showTeamLeaderDropdown && (
                      <div className="team-leader-dropdown">

                        {filteredTeamLeaders.length >
                        0 ? (
                          filteredTeamLeaders.map(
                            (leader) => (

                              <button
                                type="button"
                                className="team-leader-option"
                                key={
                                  leader._id
                                }
                                onClick={() =>
                                  handleTeamLeaderChange(
                                    leader._id
                                  )
                                }
                              >

                                <div className="team-leader-option-main">

                                  <div className="team-leader-avatar">
                                    {leader.name
                                      ?.charAt(
                                        0
                                      )
                                      ?.toUpperCase() ||
                                      "T"}
                                  </div>

                                  <div className="team-leader-option-content">

                                    <strong>
                                      {
                                        leader.name
                                      }
                                    </strong>

                                    <span>
                                      {[
                                        leader.city,
                                        leader.district,
                                        leader.state
                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          ", "
                                        ) ||
                                        "Location not available"}
                                    </span>

                                    <small>
                                      {leader.phone ||
                                        leader.email ||
                                        leader.referralCode ||
                                        "Team Leader"}
                                    </small>

                                  </div>

                                </div>

                              </button>

                            )
                          )
                        ) : (
                          <div className="team-leader-no-result">

                            <span>
                              🔍
                            </span>

                            <strong>
                              No Team Leader found
                            </strong>

                            <p>
                              Try another name,
                              city, phone or
                              referral code.
                            </p>

                          </div>
                        )}

                      </div>
                    )}

                  </>
                )}

              </div>

            </div>

            {teamLeaders.length === 0 && (
              <div className="network-message">
                No active Team Leader
                is available right now.
              </div>
            )}

          </div>

        </div>

        {/* ==================================
            RIGHT
        ================================== */}

        <div>

          {/* ==================================
              CASH PAYMENT
          ================================== */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Cash Payment
                </h2>

                <p>
                  Give the cash directly
                  to the selected Team Leader.
                </p>

              </div>

            </div>

            <div className="cash-payment-box">

              <div className="payment-icon">
                💵
              </div>

              <h3>
                CASH PAYMENT
              </h3>

              <p>
                Amount to give to
                Team Leader
              </p>

              <strong>
                ₹
                {cartTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div className="payment-pending-box">

              <span className="payment-status-icon">
                ⏳
              </span>

              <div>

                <strong>
                  Payment Pending
                </strong>

                <p>
                  Payment will become
                  PAID after the Team Leader
                  confirms cash collection.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================
              FINAL SUMMARY
          ================================== */}

          <div className="dashboard-card">

            <h2>
              Final Summary
            </h2>

            <div className="summary-row">

              <span>
                Total Items
              </span>

              <strong>
                {cartCount}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Team Leader
              </span>

              <strong>

                {selectedSeller
                  ? selectedTeamLeader?.name ||
                    "Selected"
                  : "Not Selected"}

              </strong>

            </div>

            <div className="summary-row">

              <span>
                Payment Method
              </span>

              <strong>
                CASH
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Payment Status
              </span>

              <strong className="pending-text">
                PENDING
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Order Status
              </span>

              <strong className="pending-text">
                PENDING
              </strong>

            </div>

            <div className="summary-row total">

              <span>
                Payable Amount
              </span>

              <strong>
                ₹
                {cartTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* ==================================
                PLACE ORDER
            ================================== */}

            <button
              type="button"
              className="checkout-button place-order-button"
              disabled={
                placingOrder ||
                !selectedSeller
              }
              onClick={
                placeOrder
              }
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <p className="checkout-note">

              After placing the order,
              give the cash of{" "}

              <strong>
                ₹
                {cartTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

              {" "}to the selected Team Leader.

              The Team Leader will then
              confirm the order.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;
