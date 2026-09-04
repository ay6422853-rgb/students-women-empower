
import "./Sidebar.css";
import { NavLink } from "react-router-dom";

function Sidebar({
  role,
  menus = [],
  onLogout,
  isOpen = false,
  onClose = () => {}
}) {

  const normalizedRole = role?.toUpperCase();

  // ==========================================
  // ROLE BASE PATH
  // ==========================================

  const rolePaths = {
    MEMBER: "/dashboard/member",
    TEAM_LEADER: "/dashboard/team-leader",
    SUPER_TEAM_LEADER: "/dashboard/super-team-leader",
    CHIEF_TEAM_OFFICER: "/dashboard/cto",
    PRODUCT_MANAGER: "/dashboard/product-manager",
    CASH_MANAGER: "/dashboard/cash-manager",
    DISTRIBUTION_MANAGER: "/dashboard/distribution-manager",
    ADMIN: "/dashboard/admin"
  };

  const basePath =
    rolePaths[normalizedRole] || "/dashboard";


  // ==========================================
  // ROLE BASED MENU PATH
  // ==========================================

  const menuPaths = {

    // -----------------------------
    // COMMON
    // -----------------------------

    Dashboard: "",


    // -----------------------------
    // MEMBER
    // -----------------------------

    Profile: "profile",
    "My Network": "my-network",
    Products: "products",
    Cart: "cart",
    Checkout: "checkout",
    Orders: "orders",
    Commission: "commission",
    Wallet: "wallet",
    Withdraw: "withdraw",


    // -----------------------------
    // TEAM LEADER
    // -----------------------------

    Members: "members",
    Stock: "stock",
    "Cash Collections": "cash-collections",
    "Cash Transfer": "cash-transfer",
    "Stock Transactions": "stock-transactions",


    // -----------------------------
    // SUPER TEAM LEADER
    // -----------------------------

    "Team Leaders": "team-leaders",
    "Super Team Leaders": "super-team-leaders",
    "Stock Distribution": "stock-distribution",
    Performance: "performance",
    Reports: "reports",


    // -----------------------------
    // PRODUCT MANAGER
    // -----------------------------

    Categories: "categories",
    


    // -----------------------------
    // CASH MANAGER
    // -----------------------------

    "Pending Payments": "pending-payments",
    Commissions: "commissions",
    "Weekly Payments": "weekly-payments",
    Withdrawals: "withdrawals",


    // -----------------------------
    // DISTRIBUTION MANAGER
    // -----------------------------

    Distributions: "distributions",


    // -----------------------------
    // ADMIN
    // -----------------------------

    Users: "users",
    "Referral Network": "referral-network",
    Inventory: "inventory",
    Analytics: "analytics",
    Settings: "settings"
  };


  // ==========================================
  // GET MENU PATH
  // ==========================================

  function getMenuPath(menu) {

    return (
      menuPaths[menu] ??
      menu
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
    );

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  function handleLogout() {

    if (onLogout) {
      onLogout();
    }

  }


  // ==========================================
  // SIDEBAR
  // ==========================================

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}


      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="brand-logo">
            E
          </div>

          <div className="brand-info">

            <h2>EMPOWER</h2>

            <span>
              Students & Women
            </span>

          </div>

        </div>


        {/* ROLE */}

        <div className="sidebar-role">

          <span className="role-dot" />

          <span>
            {normalizedRole
              ? normalizedRole.replace(/_/g, " ")
              : "USER"}
          </span>

        </div>


        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          {menus.map((menu) => {

            const menuPath =
              getMenuPath(menu);

            const fullPath =
              menuPath
                ? `${basePath}/${menuPath}`
                : basePath;


            return (
              <NavLink
                key={menu}
                to={fullPath}
                end={menu === "Dashboard"}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={onClose}
              >

                <span className="sidebar-icon">
                  {getIcon(menu)}
                </span>

                <span className="sidebar-label">
                  {menu}
                </span>

              </NavLink>
            );

          })}

        </nav>


        {/* LOGOUT */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >

            <span className="sidebar-icon">
              ↪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}


// ==========================================
// ICONS
// ==========================================

function getIcon(menu) {

  const icons = {

    Dashboard: "⌂",

    // Member
    Profile: "◉",
    "My Network": "♧",
    Products: "▣",
    Cart: "🛒",
    Checkout: "💳",
    Orders: "☰",
    Commission: "₹",
    Wallet: "▤",
    Withdraw: "↗",

    // Team Leader
    Members: "♟",
    Stock: "▦",
    "Cash Collections": "₹",
    "Cash Transfer": "⇄",
    "Stock Transactions": "⇄",

    // Super Team Leader
    "Team Leaders": "♟",
    "Super Team Leaders": "♟",
    "Stock Distribution": "⇄",
    Performance: "◈",
    Reports: "▤",

    // Product Manager
    Categories: "▦",

    // Cash Manager
    "Pending Payments": "◷",
    Commissions: "₹",
    "Weekly Payments": "₹",
    Withdrawals: "↗",

    // Distribution Manager
    Distributions: "⇄",

    // Admin
    Users: "♟",
    "Referral Network": "♧",
    Inventory: "▦",
    Analytics: "◈",
    Settings: "⚙"
  };

  return icons[menu] || "•";
}


export default Sidebar;
