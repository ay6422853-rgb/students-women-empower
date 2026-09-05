
import { useEffect, useState } from "react";
import "./SuperTeamLeader.css";

const API = "https://students-and-women-empower.onrender.com/api";

function TeamLeaders() {

  const [leaders, setLeaders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");


  useEffect(() => {

    loadTeamLeaders();

  }, []);


  async function loadTeamLeaders() {

    try {

      setLoading(true);
      setError("");


      const response = await fetch(
        `${API}/users/team-leaders`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );


      const data = await response.json();


      console.log(
        "Team Leaders API:",
        data
      );


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to load Team Leaders"
        );

        setLeaders([]);

        return;

      }


      setLeaders(
        data.users || []
      );


    } catch (error) {

      console.error(
        "Team Leaders error:",
        error
      );

      setError(
        "Server error. Unable to load Team Leaders."
      );

      setLeaders([]);

    } finally {

      setLoading(false);

    }

  }


  const filtered =
    leaders.filter(
      (leader) => {

        const searchText =
          search.toLowerCase().trim();


        return (

          leader.name
            ?.toLowerCase()
            .includes(searchText)

          ||

          leader.phone
            ?.toString()
            .includes(searchText)

          ||

          leader.email
            ?.toLowerCase()
            .includes(searchText)

          ||

          leader.city
            ?.toLowerCase()
            .includes(searchText)

        );

      }
    );


  return (

    <div className="stl-page">


      {/* HEADER */}

      <div className="stl-header">

        <div>

          <h1>
            Team Leaders
          </h1>

          <p>
            Manage Team Leaders under your network.
          </p>

        </div>

      </div>



      {/* TOOLBAR */}

      <div className="stl-toolbar">

        <input

          className="stl-search"

          placeholder="Search Team Leader..."

          value={search}

          onChange={(e) =>
            setSearch(e.target.value)
          }

        />

      </div>



      {/* PANEL */}

      <div className="stl-panel">


        {loading ? (

          <div className="stl-loading">

            Loading Team Leaders...

          </div>

        ) : error ? (

          <div className="stl-error">

            {error}

          </div>

        ) : filtered.length === 0 ? (

          <div className="stl-empty">

            {search
              ? "No Team Leader found."
              : "No active Team Leaders available."
            }

          </div>

        ) : (

          <div className="stl-table-wrapper">

            <table className="stl-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    City
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {filtered.map(
                  (leader) => (

                    <tr
                      key={
                        leader._id
                      }
                    >

                      <td>

                        <strong>
                          {leader.name}
                        </strong>

                      </td>


                      <td>
                        {leader.phone || "-"}
                      </td>


                      <td>
                        {leader.email || "-"}
                      </td>


                      <td>
                        {leader.city || "-"}
                      </td>


                      <td>

                        <span className="stl-status in-stock">

                          {leader.status || "ACTIVE"}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

}


export default TeamLeaders;

