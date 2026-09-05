import "./Header.css";
import { useState } from "react";

function Header({
  user,
  onLogout,
  onMenuClick,
}) {
  const [showMenu, setShowMenu] = useState(false);

  function handleMenuClick() {
    if (onMenuClick) {
      onMenuClick();
    }
  }

  return (
    <header className="top-header">

      {/* ==================================
          MOBILE MENU BUTTON
      ================================== */}

      <button
        type="button"
        className="mobile-menu-button"
        onClick={handleMenuClick}
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      {/* ==================================
          PAGE TITLE
      ================================== */}

      <div className="header-left">
        <h2>Dashboard</h2>

        <p>
          Manage your Empower account
        </p>
      </div>

      {/* ==================================
          HEADER RIGHT
      ================================== */}

      <div className="header-right">

        {/* NOTIFICATION */}

        <button
          type="button"
          className="header-icon-button"
          aria-label="Notifications"
        >
          🔔
          <span className="notification-dot"></span>
        </button>

        {/* USER */}

        <div className="header-user">

          <button
            type="button"
            className="user-button"
            onClick={() =>
              setShowMenu((prev) => !prev)
            }
          >

            <div className="user-avatar">
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <div className="user-details">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.role
                  ? user.role.replaceAll(
                      "_",
                      " "
                    )
                  : ""}
              </span>

            </div>

            <span className="dropdown-arrow">
              ▾
            </span>

          </button>

          {/* ==================================
              USER DROPDOWN
          ================================== */}

          {showMenu && (
            <div className="user-dropdown">

              <div className="dropdown-user-info">

                <div className="user-avatar large">
                  {user?.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
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
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  window.location.href =
                    "/dashboard/member/profile";
                }}
              >
                ◉ &nbsp; My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);

                  if (onLogout) {
                    onLogout();
                  }
                }}
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
