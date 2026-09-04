
import { useEffect, useState } from "react";
import "./SuperTeamLeader.css";

const API = "http://localhost:5000/api";

function StockDistribution() {

  const [stock, setStock] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);

  const [productId, setProductId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const token = localStorage.getItem("token");


  // ==========================================
  // LOAD STOCK + TEAM LEADERS
  // ==========================================

  useEffect(() => {

    loadData();

  }, []);


  async function loadData() {

    setLoading(true);
    setError("");

    try {

      const headers = {
        Authorization: `Bearer ${token}`,
      };


      // ========================================
      // MY STOCK
      // ========================================

      const stockResponse = await fetch(
        `${API}/stock/mine`,
        {
          headers,
        }
      );


      const stockData =
        await stockResponse.json();


      if (!stockResponse.ok) {

        throw new Error(
          stockData.message ||
          "Unable to load stock."
        );

      }


      setStock(
        stockData.stock?.items || []
      );


      // ========================================
      // ACTIVE TEAM LEADERS
      // ========================================

      const usersResponse = await fetch(
        `${API}/users/team-leaders`,
        {
          headers,
        }
      );


      const usersData =
        await usersResponse.json();


      console.log(
        "Team Leaders Response:",
        usersData
      );


      if (!usersResponse.ok) {

        throw new Error(
          usersData.message ||
          "Unable to load Team Leaders."
        );

      }


      setTeamLeaders(
        usersData.users || []
      );


    } catch (error) {

      console.error(
        "Load distribution data error:",
        error
      );

      setError(
        error.message ||
        "Unable to load data."
      );

    } finally {

      setLoading(false);

    }

  }


  // ==========================================
  // TRANSFER STOCK
  // ==========================================

  async function transferStock(e) {

    e.preventDefault();

    setError("");

    const amount =
      Number(quantity);


    // ========================================
    // VALIDATION
    // ========================================

    if (!productId) {

      alert(
        "Please select product."
      );

      return;

    }


    if (!toUserId) {

      alert(
        "Please select Team Leader."
      );

      return;

    }


    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {

      alert(
        "Quantity must be a positive whole number."
      );

      return;

    }


    // ========================================
    // CHECK AVAILABLE STOCK
    // ========================================

    const selectedProduct =
      stock.find(
        item =>
          String(
            item.product?._id
          ) ===
          String(productId)
      );


    const availableStock =
      Number(
        selectedProduct?.quantity || 0
      );


    if (amount > availableStock) {

      alert(
        `Only ${availableStock} units available.`
      );

      return;

    }


    try {

      setSending(true);


      // ========================================
      // TRANSFER REQUEST
      // ========================================

      const response =
        await fetch(
          `${API}/stock/transfer`,
          {

            method: "POST",

            headers: {

              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                productId,

                toUserId,

                quantity: amount,

                type:
                  "SUPER_TEAM_LEADER_TO_TEAM_LEADER",

                note:
                  note.trim(),

              }),

          }
        );


      const data =
        await response.json();


      // ========================================
      // ERROR
      // ========================================

      if (!response.ok) {

        alert(
          data.message ||
          "Stock transfer failed."
        );

        return;

      }


      // ========================================
      // SUCCESS
      // ========================================

      alert(
        data.message ||
        "Stock transferred successfully."
      );


      // ========================================
      // RESET FORM
      // ========================================

      setProductId("");
      setToUserId("");
      setQuantity("");
      setNote("");


      // ========================================
      // RELOAD DATA
      // ========================================

      await loadData();


    } catch (error) {

      console.error(
        "Transfer stock error:",
        error
      );

      alert(
        "Server error while transferring stock."
      );

    } finally {

      setSending(false);

    }

  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="stl-page">

        <div className="stl-loading">

          Loading stock and Team Leaders...

        </div>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="stl-page">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="stl-header">

        <div>

          <h1>
            Stock Distribution
          </h1>

          <p>
            Transfer stock from you to a Team Leader.
          </p>

        </div>

      </div>


      {/* ======================================
          ERROR
      ====================================== */}

      {error && (

        <div className="stl-error">

          {error}

        </div>

      )}


      {/* ======================================
          FORM
      ====================================== */}

      <div className="stl-form-panel">

        <form
          className="stl-form"
          onSubmit={transferStock}
        >


          {/* ==================================
              PRODUCT
          ================================== */}

          <div className="stl-form-group">

            <label>
              Product
            </label>


            <select
              value={productId}
              onChange={(e) => {

                setProductId(
                  e.target.value
                );

                setQuantity("");

              }}
              disabled={sending}
              required
            >

              <option value="">
                Select Product
              </option>


              {stock.map((item) => (

                <option
                  key={
                    item.product?._id
                  }
                  value={
                    item.product?._id
                  }
                >

                  {item.product?.name}

                  {" - "}

                  Available:
                  {" "}
                  {item.quantity}

                </option>

              ))}

            </select>


            {stock.length === 0 && (

              <small>
                No stock available.
              </small>

            )}

          </div>


          {/* ==================================
              TEAM LEADER
          ================================== */}

          <div className="stl-form-group">

            <label>
              Team Leader
            </label>


            <select
              value={toUserId}
              onChange={(e) =>
                setToUserId(
                  e.target.value
                )
              }
              disabled={sending}
              required
            >

              <option value="">
                Select Team Leader
              </option>


              {teamLeaders.map(
                (leader) => (

                  <option
                    key={leader._id}
                    value={leader._id}
                  >

                    {leader.name}

                    {" - "}

                    {leader.phone ||
                      leader.email}

                  </option>

                )
              )}

            </select>


            {teamLeaders.length === 0 && (

              <small>
                No active Team Leader found.
              </small>

            )}

          </div>


          {/* ==================================
              QUANTITY
          ================================== */}

          <div className="stl-form-group">

            <label>
              Quantity
            </label>


            <input
              type="number"
              min="1"
              max={
                stock.find(
                  item =>
                    String(
                      item.product?._id
                    ) ===
                    String(productId)
                )?.quantity || undefined
              }
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Enter quantity"
              disabled={
                !productId ||
                sending
              }
              required
            />


            {productId && (

              <small>

                Available:

                {" "}

                <strong>

                  {
                    stock.find(
                      item =>
                        String(
                          item.product?._id
                        ) ===
                        String(productId)
                    )?.quantity || 0
                  }

                </strong>

              </small>

            )}

          </div>


          {/* ==================================
              NOTE
          ================================== */}

          <div className="stl-form-group">

            <label>
              Note
            </label>


            <textarea
              value={note}
              onChange={(e) =>
                setNote(
                  e.target.value
                )
              }
              placeholder="Optional note"
              rows="4"
              disabled={sending}
            />

          </div>


          {/* ==================================
              SUBMIT
          ================================== */}

          <button
            type="submit"
            className="stl-submit-btn"
            disabled={
              sending ||
              stock.length === 0 ||
              teamLeaders.length === 0
            }
          >

            {sending
              ? "Transferring..."
              : "Transfer Stock"}

          </button>

        </form>

      </div>

    </div>

  );

}

export default StockDistribution;
