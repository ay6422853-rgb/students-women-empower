
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


// ==========================================
// ROLE MENUS
// ==========================================

const roleMenus = {

  // ========================================
  // MEMBER
  // ========================================

  MEMBER: [
    "Dashboard",
    "Profile",
    "My Network",
    "Products",
    "Orders",
    "Commission",
    "Wallet",
    "Withdraw"
  ],


  // ========================================
  // TEAM LEADER
  // EXACTLY ACCORDING TO App.jsx
  // ========================================

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
    "Profile"
  ],


  // ========================================
  // SUPER TEAM LEADER
  // ========================================

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
    "Profile"
  ],


  // ========================================
  // CHIEF TEAM OFFICER
  // ========================================

  CHIEF_TEAM_OFFICER: [
    "Dashboard",
    "Network",
    "Sales",
    "Team Leaders",
    "Super Team Leaders",
    "Team Building",
    "Role Management",
    "Performance",
    "Profile"
  ],


  // ========================================
  // PRODUCT MANAGER
  // ========================================

  PRODUCT_MANAGER: [
    "Dashboard",
    "Products",
    "Categories",
    "Stock",
    "AddStock",
    "Distributor",
    "Transfer Stock",
    "Distributor Stock",
    "Reports"
  ],


  // ========================================
  // CASH MANAGER
  // ========================================

  CASH_MANAGER: [
    "Dashboard",
    "Pending Transfers",
    "Commissions",
    "Transactions",
    "Admin Transfer",
    "Admin Transfer History"
  ],


  // ========================================
  // DISTRIBUTION MANAGER
  // ========================================

  DISTRIBUTION_MANAGER: [
    "Dashboard",
    "Stock",
    "Receive Stock",
    "Low Stock",
    "Transfer Stock",
    "Transactions"
  ],


  // ========================================
  // ADMIN
  // ========================================

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
    "Analytics"
  ]
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

  const userData =
    localStorage.getItem("user");

  let user = null;

  try {

    user = userData
      ? JSON.parse(userData)
      : null;

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

  const menus =
    roleMenus[user.role] ||
    roleMenus.MEMBER;


  // ========================================
  // LOGOUT
  // ========================================

  function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    nav("/");

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
        role={user.role}
        menus={menus}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />


      {/* ==================================
          MAIN
      ================================== */}

      <main className="dashboard-main">


        {/* HEADER */}

        <Header
          user={user}
          onLogout={logout}
          onMenuClick={() =>
            setSidebarOpen(true)
          }
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
