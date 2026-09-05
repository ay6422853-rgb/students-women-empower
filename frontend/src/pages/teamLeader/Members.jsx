
import React, { useEffect, useState } from "react";
import "./teamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

function Members() {
  const [referrals, setReferrals] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);

  const [activeTab, setActiveTab] = useState("approved");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ========================================
  // LOAD TEAM LEADER NETWORK
  // ========================================

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/users/my-network`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("TEAM LEADER MY NETWORK:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load Team Leader members"
        );
      }

      // ====================================
      // REFERRALS
      // Backend:
      // referrals: {
      //   count,
      //   members
      // }
      // ====================================

      setReferrals(
        Array.isArray(data.referrals?.members)
          ? data.referrals.members
          : []
      );

      // ====================================
      // CTO APPROVED / ASSIGNED MEMBERS
      // Backend:
      // approvedMembers: {
      //   count,
      //   members
      // }
      // ====================================

      setApprovedMembers(
        Array.isArray(
          data.approvedMembers?.members
        )
          ? data.approvedMembers.members
          : []
      );

    } catch (err) {
      console.error(
        "Team Leader members error:",
        err
      );

      setError(
        err.message ||
          "Unable to load members"
      );

      setReferrals([]);
      setApprovedMembers([]);

    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    loadMembers();
  }, []);

  // ========================================
  // CURRENT LIST
  // ========================================

  const currentMembers =
    activeTab === "approved"
      ? approvedMembers
      : referrals;

  // ========================================
  // SEARCH
  // ========================================

  const filteredMembers =
    currentMembers.filter((member) => {
      const searchText = `
        ${member.name || ""}
        ${member.email || ""}
        ${member.phone || ""}
        ${member.city || ""}
        ${member.district || ""}
        ${member.state || ""}
        ${member.pincode || ""}
      `.toLowerCase();

      return searchText.includes(
        search.toLowerCase()
      );
    });

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="tl-page">

      {/* ====================================
          HEADER
      ==================================== */}

      <div className="tl-page-header">

        <div>
          <h1>My Members</h1>

          <p>
            View CTO assigned members and
            your referral network
          </p>
        </div>

        <div className="tl-count-badge">
          {currentMembers.length}{" "}
          {activeTab === "approved"
            ? "Approved Members"
            : "Referrals"}
        </div>

      </div>

      {/* ====================================
          ERROR
      ==================================== */}

      {error && (
        <div className="tl-error">
          {error}
        </div>
      )}

      {/* ====================================
          TABS
      ==================================== */}

      <div className="tl-toolbar">

        <button
          type="button"
          className={
            activeTab === "approved"
              ? "tl-btn primary"
              : "tl-btn secondary"
          }
          onClick={() => {
            setActiveTab("approved");
            setSearch("");
          }}
        >
          CTO Approved Members (
          {approvedMembers.length}
          )
        </button>

        <button
          type="button"
          className={
            activeTab === "referrals"
              ? "tl-btn primary"
              : "tl-btn secondary"
          }
          onClick={() => {
            setActiveTab("referrals");
            setSearch("");
          }}
        >
          My Referrals (
          {referrals.length}
          )
        </button>

      </div>

      {/* ====================================
          SEARCH + REFRESH
      ==================================== */}

      <div className="tl-toolbar">

        <input
          type="text"
          placeholder={
            activeTab === "approved"
              ? "Search approved member..."
              : "Search referral..."
          }
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button
          type="button"
          className="tl-btn secondary"
          onClick={loadMembers}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {/* ====================================
          CONTENT
      ==================================== */}

      {loading ? (

        <div className="tl-loading">
          Loading members...
        </div>

      ) : (

        <div className="tl-section">

          {/* ==================================
              SECTION HEADER
          ================================== */}

          <div className="tl-section-header">

            <div>

              <h2>
                {activeTab === "approved"
                  ? "CTO Approved Members"
                  : "My Referrals"}
              </h2>

              <p>
                {activeTab === "approved"
                  ? "Members assigned to you by CTO"
                  : "Members registered through your referral"}
              </p>

            </div>

            <strong>
              {filteredMembers.length}
            </strong>

          </div>

          {/* ==================================
              EMPTY
          ================================== */}

          {filteredMembers.length === 0 ? (

            <div className="tl-empty">

              {search
                ? "No member found for this search."
                : activeTab === "approved"
                  ? "No CTO approved members found."
                  : "No referral members found."}

            </div>

          ) : (

            /* ==================================
               TABLE
            ================================== */

            <div className="tl-table-wrapper">

              <table className="tl-table">

                <thead>

                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredMembers.map(
                    (member) => (

                      <tr
                        key={member._id}
                      >

                        <td>
                          <strong>
                            {member.name ||
                              "Member"}
                          </strong>
                        </td>

                        <td>
                          {member.email ||
                            "-"}
                        </td>

                        <td>
                          {member.phone ||
                            "-"}
                        </td>

                        <td>
                          {[
                            member.city,
                            member.district,
                            member.state,
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                            "-"}
                        </td>

                        <td>

                          <span
                            className={
                              `tl-status ${
                                String(
                                  member.status ||
                                    ""
                                ).toLowerCase()
                              }`
                            }
                          >
                            {member.status ||
                              "-"}
                          </span>

                        </td>

                        <td>
                          {member.createdAt
                            ? new Date(
                                member.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default Members;

