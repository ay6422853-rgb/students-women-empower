import { useMemo, useState } from "react";
import "./Users.css";

function Users() {

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [users, setUsers] = useState([
    {
      _id: "1",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      phone: "9876543210",
      city: "Varanasi",
      role: "MEMBER",
      status: "ACTIVE"
    },
    {
      _id: "2",
      name: "Priya Singh",
      email: "priya@example.com",
      phone: "9876543211",
      city: "Varanasi",
      role: "TEAM_LEADER",
      status: "ACTIVE"
    },
    {
      _id: "3",
      name: "Neha Sharma",
      email: "neha@example.com",
      phone: "9876543212",
      city: "Lucknow",
      role: "SUPER_TEAM_LEADER",
      status: "ACTIVE"
    },
    {
      _id: "4",
      name: "Amit Verma",
      email: "amit@example.com",
      phone: "9876543213",
      city: "Prayagraj",
      role: "MEMBER",
      status: "PENDING"
    }
  ]);

  const filteredUsers = useMemo(() => {

    return users.filter(user => {

      const text = search.toLowerCase().trim();

      const searchMatch =
        !text ||
        user.name.toLowerCase().includes(text) ||
        user.email.toLowerCase().includes(text) ||
        user.phone.includes(text) ||
        user.city.toLowerCase().includes(text);

      const roleMatch =
        role === "ALL" ||
        user.role === role;

      const statusMatch =
        status === "ALL" ||
        user.status === status;

      return searchMatch &&
        roleMatch &&
        statusMatch;
    });

  }, [users, search, role, status]);


  function changeRole(id, newRole) {

    setUsers(prev =>
      prev.map(user =>
        user._id === id
          ? { ...user, role: newRole }
          : user
      )
    );
  }


  return (
    <div className="cto-users-page">

      <div className="cto-page-title">

        <div>
          <h1>Users</h1>

          <p>
            Manage Members, Team Leaders and
            Super Team Leaders.
          </p>
        </div>

        <div className="user-count">
          {filteredUsers.length} Users
        </div>

      </div>


      {/* FILTERS */}

      <div className="users-filter-card">

        <div className="user-search">

          <span>🔎</span>

          <input
            type="text"
            placeholder="Search name, email, phone, city..."
            value={search}
            onChange={e =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={role}
          onChange={e =>
            setRole(e.target.value)
          }
        >

          <option value="ALL">
            All Roles
          </option>

          <option value="MEMBER">
            Member
          </option>

          <option value="TEAM_LEADER">
            Team Leader
          </option>

          <option value="SUPER_TEAM_LEADER">
            Super Team Leader
          </option>

        </select>


        <select
          value={status}
          onChange={e =>
            setStatus(e.target.value)
          }
        >

          <option value="ALL">
            All Status
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="SUSPENDED">
            Suspended
          </option>

        </select>

      </div>


      {/* TABLE */}

      <div className="users-table-card">

        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>

              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Role</th>
                <th>Status</th>
                <th>Change Role</th>
              </tr>

            </thead>

            <tbody>

              {filteredUsers.map(user => (

                <tr key={user._id}>

                  <td>

                    <div className="user-info">

                      <div className="user-avatar">
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {user.name}
                        </strong>

                        <small>
                          {user.email}
                        </small>
                      </div>

                    </div>

                  </td>


                  <td>
                    {user.phone}
                  </td>


                  <td>
                    {user.city}
                  </td>


                  <td>

                    <span className="role-badge">
                      {user.role
                        .replaceAll("_", " ")}
                    </span>

                  </td>


                  <td>

                    <span
                      className={`user-status ${user.status.toLowerCase()}`}
                    >
                      {user.status}
                    </span>

                  </td>


                  <td>

                    <select
                      value={user.role}
                      onChange={e =>
                        changeRole(
                          user._id,
                          e.target.value
                        )
                      }
                    >

                      <option value="MEMBER">
                        MEMBER
                      </option>

                      <option value="TEAM_LEADER">
                        TEAM LEADER
                      </option>

                      <option value="SUPER_TEAM_LEADER">
                        SUPER TEAM LEADER
                      </option>

                    </select>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Users;
