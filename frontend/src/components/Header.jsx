import "./Header.css";
import { useState } from "react";


function Header({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="top-header">

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("toggle-sidebar")
          );
        }}
      >
        ☰
      </button>

      {/* Page Title */}
      <div className="header-left">
        <h2>Dashboard</h2>
        <p>
          Manage your Empower account
        </p>
      </div>


      {/* Header Right */}
      <div className="header-right">

        {/* Notification */}
        <button className="header-icon-button">
          🔔
          <span className="notification-dot"></span>
        </button>


        {/* User */}
        <div className="header-user">

          <button
            className="user-button"
            onClick={() => setShowMenu(!showMenu)}
          >

            <div className="user-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="user-details">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.role?.replaceAll("_", " ")}
              </span>

            </div>

            <span className="dropdown-arrow">
              ▾
            </span>

          </button>


          {/* Dropdown */}
          {showMenu && (

            <div className="user-dropdown">

              <div className="dropdown-user-info">

                <div className="user-avatar large">
                  {user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>
                  <strong>
                    {user?.name || "User"}
                  </strong>

                  <span>
                    {user?.email || ""}
                  </span>
                </div>

              </div>


              <div className="dropdown-divider"></div>


              <button
                onClick={() => {
                  window.location.href =
                    "/dashboard/member/profile";
                }}
              >
                ◉ &nbsp; My Profile
              </button>


              <button
                onClick={onLogout}
                className="dropdown-logout"
              >
                ↪ &nbsp; Logout
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Header;