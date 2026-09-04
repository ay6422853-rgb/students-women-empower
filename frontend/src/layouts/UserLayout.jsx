import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./UserLayout.css";

// ==========================================
// ROLE MENUS
// ==========================================

const roleMenus = {
  MEMBER: [
    "Dashboard",
    "Profile",
    "My Network",
    "Products",
    "Orders",
    "Commission",
    "Wallet",
    "Withdraw",
  ],

  TEAM_LEADER: [
    "Dashboard",
    "Members",
    "Stock",
    "Orders",
    "Cash Collections",
    "Cash Transfer",
    "Stock Transactions",
    "Commission",
    "Wallet",
    "Withdraw",
    "Profile",
  ],

  SUPER_TEAM_LEADER: [
    "Dashboard",
    "Network",
    "Stock",
    "Low Stock",
    "Transactions",
    "Team Leaders",
    "Stock Distribution",
    "Sales",
    "Commission",
    "Wallet",
    "Profile",
  ],

  CHIEF_TEAM_OFFICER: [
    "Dashboard",
    "Network",
    "Sales",
    "Team Leaders",
    "Super Team Leaders",
    "Team Building",
    "Role Management",
    "Performance",
    "Profile",
  ],

  PRODUCT_MANAGER: [
    "Dashboard",
    "Products",
    "Categories",
    "Stock",
    "AddStock",
    "Distributor",
    "Transfer Stock",
    "Distributor Stock",
    "Reports",
  ],

  CASH_MANAGER: [
    "Dashboard",
    "Pending Transfers",
    "Commissions",
    "Transactions",
    "Admin Transfer",
    "Admin Transfer History",
  ],

  DISTRIBUTION_MANAGER: [
    "Dashboard",
    "Stock",
    "Receive Stock",
    "Low Stock",
    "Transfer Stock",
    "Transactions",
  ],

  ADMIN: [
    "Dashboard",
    "Users",
    "Referral Network",
    "Products",
    "Inventory",
    "Orders",
    "Sales",
    "Cash Transactions",
    "Pending Cash Transfers",
    "Admin Transfers",
    "Commissions",
    "Withdrawls",
    "Analytics",
  ],
};

// ==========================================
// USER LAYOUT
// ==========================================

function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useNavigate();

  // ========================================
  // GET USER
  // ========================================

  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  // ========================================
  // USER NOT FOUND
  // ========================================

  if (!user) {
    nav("/");
    return null;
  }

  // ========================================
  // GET ROLE MENUS
  // ========================================

  const normalizedRole = String(user.role || "").toUpperCase();

  const menus =
    roleMenus[normalizedRole] ||
    roleMenus.MEMBER;

  // ========================================
  // LOGOUT
  // ========================================

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSidebarOpen(false);

    nav("/");
  }

  // ========================================
  // OPEN SIDEBAR
  // ========================================

  function openSidebar() {
    setSidebarOpen(true);
  }

  // ========================================
  // CLOSE SIDEBAR
  // ========================================

  function closeSidebar() {
    setSidebarOpen(false);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="dashboard-layout">

      {/* ==================================
          SIDEBAR
      ================================== */}

      <Sidebar
        role={normalizedRole}
        menus={menus}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* ==================================
          MAIN CONTENT
      ================================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <Header
          user={user}
          onLogout={logout}
          onMenuClick={openSidebar}
        />

        {/* PAGE */}

        <div className="dashboard-page">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default UserLayout;