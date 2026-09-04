
import { useEffect, useState } from "react";
import "./distributionManager.css";

const API_URL = "http://localhost:5000/api";

function TransferStock() {

  const [products, setProducts] = useState([]);
  const [leaders, setLeaders] = useState([]);

  const [form, setForm] = useState({
    productId: "",
    toUserId: "",
    quantity: "",
    note: ""
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = localStorage.getItem("token");


  // ==========================================
  // LOAD STOCK + SUPER TEAM LEADERS
  // ==========================================

  useEffect(() => {

    loadData();

  }, []);


  async function loadData() {

    setLoadingData(true);

    try {

      const headers = {
        Authorization: `Bearer ${token}`
      };


      // ==========================================
      // MY STOCK
      // ==========================================

      const stockResponse = await fetch(
        `${API_URL}/stock/mine`,
        {
          headers
        }
      );


      const stockData =
        await stockResponse.json();


      if (!stockResponse.ok) {

        throw new Error(
          stockData.message ||
          "Unable to load stock"
        );

      }


      setProducts(
        stockData.stock?.items || []
      );


      // ==========================================
      // SUPER TEAM LEADERS
      // ==========================================

      const usersResponse = await fetch(
        `${API_URL}/users/super-team-leaders`,
        {
          headers
        }
      );


      const usersData =
        await usersResponse.json();


      console.log(
        "Super Team Leaders:",
        usersData
      );


      if (!usersResponse.ok) {

        throw new Error(
          usersData.message ||
          "Unable to load Super Team Leaders"
        );

      }


      setLeaders(
        usersData.users || []
      );


    } catch (error) {

      console.error(
        "Load transfer data error:",
        error
      );

      setMessage(
        error.message ||
        "Unable to load transfer data"
      );

      setMessageType("error");

    } finally {

      setLoadingData(false);

    }

  }


  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(e) {

    const {
      name,
      value
    } = e.target;


    setForm(prev => ({
      ...prev,
      [name]: value
    }));


    // Product change par quantity reset
    if (name === "productId") {

      setForm(prev => ({
        ...prev,
        productId: value,
        quantity: ""
      }));

    }


    setMessage("");

    setMessageType("");

  }


  // ==========================================
  // SELECTED PRODUCT
  // ==========================================

  const selectedProduct =
    products.find(
      item =>
        String(
          item.product?._id
        ) ===
        String(
          form.productId
        )
    );


  const availableQuantity =
    Number(
      selectedProduct?.quantity || 0
    );


  // ==========================================
  // TRANSFER STOCK
  // ==========================================

  async function handleSubmit(e) {

    e.preventDefault();


    setMessage("");
    setMessageType("");


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!form.productId) {

      setMessage(
        "Please select a product."
      );

      setMessageType("error");

      return;

    }


    if (!form.toUserId) {

      setMessage(
        "Please select a Super Team Leader."
      );

      setMessageType("error");

      return;

    }


    if (!form.quantity) {

      setMessage(
        "Please enter quantity."
      );

      setMessageType("error");

      return;

    }


    const quantity =
      Number(form.quantity);


    if (!Number.isInteger(quantity)) {

      setMessage(
        "Quantity must be a whole number."
      );

      setMessageType("error");

      return;

    }


    if (quantity <= 0) {

      setMessage(
        "Quantity must be greater than 0."
      );

      setMessageType("error");

      return;

    }


    if (quantity > availableQuantity) {

      setMessage(
        `Only ${availableQuantity} units are available.`
      );

      setMessageType("error");

      return;

    }


    setLoading(true);


    try {

      // ==========================================
      // POST TRANSFER
      // ==========================================

      const response =
        await fetch(
          `${API_URL}/stock/transfer`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body:
              JSON.stringify({

                productId:
                  form.productId,

                toUserId:
                  form.toUserId,

                quantity,

                type:
                  "DISTRIBUTOR_TO_SUPER_TEAM_LEADER",

                note:
                  form.note.trim()

              })

          }
        );


      const data =
        await response.json();


      // ==========================================
      // ERROR
      // ==========================================

      if (!response.ok) {

        setMessage(
          data.message ||
          "Stock transfer failed."
        );

        setMessageType("error");

        return;

      }


      // ==========================================
      // SUCCESS
      // ==========================================

      setMessage(
        data.message ||
        "Stock transferred successfully."
      );

      setMessageType("success");


      // ==========================================
      // RESET FORM
      // ==========================================

      setForm({

        productId: "",
        toUserId: "",
        quantity: "",
        note: ""

      });


      // ==========================================
      // RELOAD STOCK
      // ==========================================

      await loadData();


    } catch (error) {

      console.error(
        "Transfer stock error:",
        error
      );


      setMessage(
        "Server error. Please try again."
      );

      setMessageType("error");

    } finally {

      setLoading(false);

    }

  }


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="dm-page">


      {/* ========================================
          HEADER
      ======================================== */}

      <div className="dm-page-header">

        <div>

          <h1>
            Transfer Stock
          </h1>

          <p>
            Transfer stock to a Super Team Leader
          </p>

        </div>

      </div>


      {/* ========================================
          LAYOUT
      ======================================== */}

      <div className="dm-form-layout">


        {/* ======================================
            FORM CARD
        ====================================== */}

        <div className="dm-card">

          <div className="dm-card-header">

            <div>

              <h2>
                Stock Transfer
              </h2>

              <p>
                Distribution Manager → Super Team Leader
              </p>

            </div>

          </div>


          {/* ====================================
              LOADING
          ==================================== */}

          {loadingData && (

            <div className="dm-message">

              Loading stock and Super Team Leaders...

            </div>

          )}


          {/* ====================================
              MESSAGE
          ==================================== */}

          {message && !loadingData && (

            <div
              className={`dm-message ${
                messageType === "success"
                  ? "dm-success"
                  : "dm-error"
              }`}
            >

              {message}

            </div>

          )}


          {/* ====================================
              FORM
          ==================================== */}

          <form
            className="dm-form"
            onSubmit={handleSubmit}
          >


            {/* ==================================
                PRODUCT
            ================================== */}

            <div className="dm-form-group">

              <label>
                Product *
              </label>


              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                required
                disabled={
                  loadingData ||
                  loading
                }
              >

                <option value="">
                  Select Product
                </option>


                {products.map(item => (

                  <option
                    key={
                      item.product?._id
                    }
                    value={
                      item.product?._id
                    }
                  >

                    {item.product?.name}
                    {" — "}
                    Stock: {item.quantity}

                  </option>

                ))}

              </select>


              {!loadingData &&
                products.length === 0 && (

                  <small>
                    No stock available.
                  </small>

                )}

            </div>


            {/* ==================================
                SUPER TEAM LEADER
            ================================== */}

            <div className="dm-form-group">

              <label>
                Super Team Leader *
              </label>


              <select
                name="toUserId"
                value={form.toUserId}
                onChange={handleChange}
                required
                disabled={
                  loadingData ||
                  loading
                }
              >

                <option value="">
                  Select Super Team Leader
                </option>


                {leaders.map(user => (

                  <option
                    key={user._id}
                    value={user._id}
                  >

                    {user.name}
                    {" — "}
                    {user.email}

                  </option>

                ))}

              </select>


              {!loadingData &&
                leaders.length === 0 && (

                  <small>
                    No active Super Team Leader found.
                  </small>

                )}

            </div>


            {/* ==================================
                QUANTITY
            ================================== */}

            <div className="dm-form-group">

              <label>
                Quantity *
              </label>


              <input
                type="number"
                name="quantity"
                min="1"
                max={
                  availableQuantity ||
                  undefined
                }
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                required
                disabled={
                  !form.productId ||
                  loading
                }
              />


              {selectedProduct && (

                <small>

                  Available:
                  {" "}

                  <strong>
                    {availableQuantity}
                  </strong>

                  {" "}units

                </small>

              )}

            </div>


            {/* ==================================
                NOTE
            ================================== */}

            <div className="dm-form-group">

              <label>
                Note
              </label>


              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Optional note..."
                rows="4"
                disabled={loading}
              />

            </div>


            {/* ==================================
                SUBMIT
            ================================== */}

            <button
              type="submit"
              className="dm-primary-btn dm-submit-btn"
              disabled={
                loading ||
                loadingData ||
                products.length === 0 ||
                leaders.length === 0
              }
            >

              {loading
                ? "Transferring..."
                : "Transfer Stock"}

            </button>

          </form>

        </div>


        {/* ======================================
            INFORMATION CARD
        ====================================== */}

        <div className="dm-card dm-info-card">


          <h2>
            Transfer Flow
          </h2>


          <div className="dm-flow">


            {/* DISTRIBUTION MANAGER */}

            <div className="dm-flow-item">

              <span>
                1
              </span>

              <div>

                <strong>
                  Distribution Manager
                </strong>

                <small>
                  Your stock
                </small>

              </div>

            </div>


            <div className="dm-flow-arrow">
              ↓
            </div>


            {/* SUPER TEAM LEADER */}

            <div className="dm-flow-item">

              <span>
                2
              </span>

              <div>

                <strong>
                  Super Team Leader
                </strong>

                <small>
                  Receiver
                </small>

              </div>

            </div>

          </div>


          {/* ====================================
              IMPORTANT
          ==================================== */}

          <div className="dm-warning-box">

            <span>
              ⚠️
            </span>

            <div>

              <strong>
                Important
              </strong>

              <p>
                Transfer hone ke baad quantity
                aapke stock se automatically
                minus ho jayegi aur receiver
                ke stock me add ho jayegi.
              </p>

            </div>

          </div>


          {/* ====================================
              CURRENT STOCK
          ==================================== */}

          {selectedProduct && (

            <div className="dm-stock-summary">

              <h3>
                Selected Product
              </h3>

              <p>

                <strong>
                  {selectedProduct.product?.name}
                </strong>

              </p>

              <p>

                Available Stock:
                {" "}

                <strong>
                  {availableQuantity}
                </strong>

              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default TransferStock;
