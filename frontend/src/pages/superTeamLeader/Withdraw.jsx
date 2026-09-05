import "./SuperTeamLeader.css";

function Withdraw() {
  return (
    <div className="stl-page">

      <div className="stl-header">
        <div>
          <h1>Withdraw</h1>
          <p>Request withdrawal from your wallet.</p>
        </div>
      </div>

      <div className="stl-form-panel">

        <div className="stl-form">

          <div className="stl-form-group">
            <label>Amount</label>

            <input
              type="number"
              min="1"
              placeholder="Enter withdrawal amount"
            />
          </div>

          <button className="stl-submit-btn">
            Request Withdrawal
          </button>

        </div>

      </div>

    </div>
  );
}

export default Withdraw;
