
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import UserLayout from "./layouts/UserLayout";

// ========================================
// MEMBER
// ========================================

import MemberDashboard from "./pages/member/MemberDashboard";
import MemberProfile from "./pages/member/Profile";
import MyNetwork from "./pages/member/MyNerwork";
import MemberProducts from "./pages/member/Products";
import Checkout from "./pages/member/Checkout";
import Orders from "./pages/member/Orders";
import Commission from "./pages/member/Commission";
import Wallet from "./pages/member/Wallet";
import Cart from "./pages/member/Cart";
import Withdraw from "./pages/member/Withdraw";

// ========================================
// PRODUCT MANAGER
// ========================================

import ProductManagerDashboard
  from "./pages/productManager/ProductManagerDashboard";

import ProductManagerProducts
  from "./pages/productManager/Products";

import Categories
  from "./pages/productManager/Categories";

import Stock
  from "./pages/productManager/Stock";

import Reports
  from "./pages/productManager/Reports";

import AddStock from "./pages/productManager/AddStock";
import TransferStockToDistributor from "./pages/productManager/TransferStock";
import DistributorStock from "./pages/productManager/DistributorStock";
import Distributors from "./pages/productManager/Distributors";


// ========================================
// DISTRIBUTION MANAGER
// ========================================

import DistributionManagerDashboard
  from "./pages/distributionManager/DistributionDashboard";

import DistributionManagerStock
  from "./pages/distributionManager/Stock";

import DistributionManagerReceiveStock
  from "./pages/distributionManager/RecieveStock";

import DistributionManagerTransferStock
  from "./pages/distributionManager/TransferStock";

import DistributionManagerLowStock
  from "./pages/distributionManager/LowStock";

import DistributionManagerTransactions
  from "./pages/distributionManager/Transactions";


// ========================================
// TEAM LEADER
// ========================================

import TeamLeaderDashboard
  from "./pages/teamLeader/TeamLeaderDashboard";

import TeamLeaderMembers
  from "./pages/teamLeader/Members";

import TeamLeaderStock
  from "./pages/teamLeader/Stock";

import TeamLeaderOrders
  from "./pages/teamLeader/Orders";

import CashCollections
  from "./pages/teamLeader/CashCollections";

import CashTransfer
  from "./pages/teamLeader/CashTransfer";

import StockTransactions
  from "./pages/teamLeader/StockTransactions";

import TeamLeaderProfile
  from "./pages/teamLeader/Profile";

import TeamLeaderWallet
  from "./pages/teamLeader/Wallet";

import TeamLeaderWithdraw
  from "./pages/teamLeader/Withdraw";

import TeamLeaderCommission
  from "./pages/teamLeader/Commission";

// ========================================
// SUPER TEAM LEADER
// ========================================

import SuperTeamLeaderDashboard
  from "./pages/superTeamLeader/SuperTeamLeaderDashboard";

import SuperTeamLeaderNetwork
  from "./pages/superTeamLeader/Network";

import SuperTeamLeaderStock
  from "./pages/superTeamLeader/Stock";

import SuperTeamLeaderTeamLeaders
  from "./pages/superTeamLeader/TeamLeaders";

import SuperTeamLeaderStockDistribution
  from "./pages/superTeamLeader/StockDistribution";

import SuperTeamLeaderLowStock
  from "./pages/superTeamLeader/LowStock";

import SuperTeamLeaderTransactions
  from "./pages/superTeamLeader/Transactions";

import SuperTeamLeaderSales
  from "./pages/superTeamLeader/Sales";

import SuperTeamLeaderCommission
  from "./pages/superTeamLeader/Commission";

import SuperTeamLeaderWallet
  from "./pages/superTeamLeader/Wallet";

import SuperTeamLeaderWithdraw
  from "./pages/superTeamLeader/Withdraw";

import SuperTeamLeaderProfile
  from "./pages/superTeamLeader/Profile";


import CTODashboard
  from "./pages/cto/CTODashboard";

import CTOUsers
  from "./pages/cto/Users";

import TeamBuilding
  from "./pages/cto/TeamBuilding";

import CTONetwork
  from "./pages/cto/Network";

import CTOPerformance
  from "./pages/cto/Performance";

import CTOTeamLeaders
  from "./pages/cto/TeamLeaders";

import CTOSuperTeamLeaders
  from "./pages/cto/SuperTeamLeaders";

import CTOProfile
  from "./pages/cto/Profile";

import CTORoleManagement from "./pages/cto/RoleManagement";
import CTOSales from "./pages/cto/Sales";



import CashManagerDashboard from "./pages/cashManager/CashManagerDashboard";
import PendingTransfers from "./pages/cashManager/PendingTransfers";
import CashTransactions from "./pages/cashManager/CashTransactions";
import Commissions from "./pages/cashManager/Commissions";
import AdminTransfer from "./pages/cashManager/AdminTransfer";
import AdminTransferHistory from "./pages/cashManager/AdminTransferHistory";


import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminReferralNetwork from "./pages/admin/ReferralNetwork";
import AdminProducts from "./pages/admin/Products";
import AdminInventory from "./pages/admin/Inventory";
import AdminOrders from "./pages/admin/Orders";
import AdminPendingCashTransfers from "./pages/admin/PendingCashTransfers";
import AdminCashTransactions from "./pages/admin/CashTransactions";
import AdminCommissions from "./pages/admin/Commissions";
import AdminTransfers from "./pages/admin/AdminTransfers";
import AdminSales from "./pages/admin/Sales"


// ========================================
// PROTECTED ROUTE
// ========================================

function ProtectedRoute({ children, allowedRoles }) {

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {

    localStorage.clear();

    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


// ========================================
// DASHBOARD REDIRECT
// ========================================

function DashboardRedirect() {

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {

    localStorage.clear();

    return <Navigate to="/" replace />;
  }

  switch (user.role) {

    case "MEMBER":
      return (
        <Navigate
          to="/dashboard/member"
          replace
        />
      );

    case "TEAM_LEADER":
      return (
        <Navigate
          to="/dashboard/team-leader"
          replace
        />
      );

    case "SUPER_TEAM_LEADER":
      return (
        <Navigate
          to="/dashboard/super-team-leader"
          replace
        />
      );

    case "CHIEF_TEAM_OFFICER":
      return (
        <Navigate
          to="/dashboard/cto"
          replace
        />
      );

    case "PRODUCT_MANAGER":
      return (
        <Navigate
          to="/dashboard/product-manager"
          replace
        />
      );

    case "CASH_MANAGER":
      return (
        <Navigate
          to="/dashboard/cash-manager"
          replace
        />
      );

    case "DISTRIBUTION_MANAGER":
      return (
        <Navigate
          to="/dashboard/distribution-manager"
          replace
        />
      );

    case "ADMIN":
      return (
        <Navigate
          to="/dashboard/admin"
          replace
        />
      );

    default:
      return <Navigate to="/" replace />;
  }
}


// ========================================
// APP
// ========================================

function App() {

  return (

    <Routes>

      {/* =================================
          AUTH
      ================================= */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =================================
          DASHBOARD REDIRECT
      ================================= */}

      <Route
        path="/dashboard"
        element={<DashboardRedirect />}
      />


      {/* =================================
          USER LAYOUT
      ================================= */}

      <Route element={<UserLayout />}>


        {/* =================================
            MEMBER DASHBOARD
        ================================= */}

        <Route
          path="/dashboard/member"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <MemberDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER PROFILE
        ================================= */}

        <Route
          path="/dashboard/member/profile"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <MemberProfile />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER NETWORK
        ================================= */}

        <Route
          path="/dashboard/member/my-network"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <MyNetwork />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER PRODUCTS
        ================================= */}

        <Route
          path="/dashboard/member/products"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <MemberProducts />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER CART
        ================================= */}

        <Route
          path="/dashboard/member/cart"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <Cart />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER CHECKOUT
        ================================= */}

        <Route
          path="/dashboard/member/checkout"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <Checkout />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER ORDERS
        ================================= */}

        <Route
          path="/dashboard/member/orders"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <Orders />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER COMMISSION
        ================================= */}

        <Route
          path="/dashboard/member/commission"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <Commission />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER WALLET
        ================================= */}

        <Route
          path="/dashboard/member/wallet"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <Wallet />
            </ProtectedRoute>
          }
        />


        {/* =================================
            MEMBER WITHDRAW
        ================================= */}

        <Route
          path="/dashboard/member/withdraw"
          element={
            <ProtectedRoute
              allowedRoles={["MEMBER"]}
            >
              <Withdraw />
            </ProtectedRoute>
          }
        />


        {/* =================================
            TEAM LEADER DASHBOARD
        ================================= */}

        <Route
          path="/dashboard/team-leader"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderDashboard />
              </ProtectedRoute>
          }
        />


        {/* =================================
            TEAM LEADER MEMBERS
        ================================= */}

        <Route
          path="/dashboard/team-leader/members"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderMembers />
              </ProtectedRoute>
          }
        />


        {/* =================================
            TEAM LEADER STOCK
        ================================= */}

        <Route
          path="/dashboard/team-leader/stock"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderStock />
              </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/team-leader/wallet"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderWallet />
              </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/team-leader/withdraw"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderWithdraw />
              </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/team-leader/commission"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderCommission />
              </ProtectedRoute>
          }
        />


        {/* =================================
            TEAM LEADER ORDERS
        ================================= */}

        <Route
          path="/dashboard/team-leader/orders"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderOrders />
              </ProtectedRoute>
          }
        />


        {/* =================================
            CASH COLLECTIONS
        ================================= */}

        <Route
          path="/dashboard/team-leader/cash-collections"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <CashCollections />
              </ProtectedRoute>
          }
        />


        {/* =================================
            CASH TRANSFER
        ================================= */}

        <Route
          path="/dashboard/team-leader/cash-transfer"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <CashTransfer />
              </ProtectedRoute>
          }
        />


        {/* =================================
            STOCK TRANSACTIONS
        ================================= */}

        <Route
          path="/dashboard/team-leader/stock-transactions"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <StockTransactions />
              </ProtectedRoute>
          }
        />


        {/* =================================
            TEAM LEADER PROFILE
        ================================= */}

        <Route
          path="/dashboard/team-leader/profile"
          element={
            <ProtectedRoute
              allowedRoles={["TEAM_LEADER"]}
            >
              <TeamLeaderProfile />
            </ProtectedRoute>
          }
        />


        {/* =================================
            SUPER TEAM LEADER
        ================================= */}

        <Route
          path="/dashboard/super-team-leader"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/network"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderNetwork />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/stock"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderStock />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/team-leaders"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderTeamLeaders />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/stock-distribution"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderStockDistribution />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/low-stock"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderLowStock />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/transactions"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderTransactions />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/sales"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderSales />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/commission"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderCommission />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/wallet"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderWallet />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/withdraw"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderWithdraw />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/super-team-leader/profile"
          element={
            <ProtectedRoute
              allowedRoles={["SUPER_TEAM_LEADER"]}
            >
              <SuperTeamLeaderProfile />
            </ProtectedRoute>
          }
        />


        {/* =================================
            CTO
        ================================= */}

        <Route
          path="/dashboard/cto"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTODashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/users"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTOUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/role-management"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTORoleManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/team-building"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <TeamBuilding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/network"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTONetwork />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/performance"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTOPerformance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/team-leaders"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTOTeamLeaders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/super-team-leaders"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTOSuperTeamLeaders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/profile"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTOProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cto/sales"
          element={
            <ProtectedRoute
              allowedRoles={["CHIEF_TEAM_OFFICER"]}
            >
              <CTOSales />
            </ProtectedRoute>
          }
        />


        {/* =================================
            PRODUCT MANAGER DASHBOARD
        ================================= */}

        <Route
          path="/dashboard/product-manager"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <ProductManagerDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================
            PRODUCT MANAGER PRODUCTS
        ================================= */}

        <Route
          path="/dashboard/product-manager/products"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <ProductManagerProducts />
            </ProtectedRoute>
          }
        />


        {/* =================================
            PRODUCT MANAGER CATEGORIES
        ================================= */}

        <Route
          path="/dashboard/product-manager/categories"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <Categories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/product-manager/addstock"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <AddStock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/product-manager/transfer-stock"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <TransferStockToDistributor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/product-manager/distributor"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <Distributors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/product-manager/distributor-stock"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <DistributorStock />
            </ProtectedRoute>
          }
        />


        {/* =================================
            PRODUCT MANAGER STOCK
        ================================= */}

        <Route
          path="/dashboard/product-manager/stock"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
              <Stock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/product-manager/reports"
          element={
            <ProtectedRoute
              allowedRoles={["PRODUCT_MANAGER"]}
            >
            <Reports />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/cash-manager"
          element={
            <ProtectedRoute
              allowedRoles={["CASH_MANAGER"]}
            >
              <CashManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cash-manager/pending-transfers"
          element={
            <ProtectedRoute
              allowedRoles={["CASH_MANAGER"]}
            >
              <PendingTransfers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cash-manager/transactions"
          element={
            <ProtectedRoute
              allowedRoles={["CASH_MANAGER"]}
            >
              <CashTransactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cash-manager/commissions"
          element={
            <ProtectedRoute
              allowedRoles={["CASH_MANAGER"]}
            >
              <Commissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cash-manager/admin-transfer"
          element={
            <ProtectedRoute
              allowedRoles={["CASH_MANAGER"]}
            >
              <AdminTransfer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/cash-manager/admin-transfer-history"
          element={
            <ProtectedRoute
              allowedRoles={["CASH_MANAGER"]}
            >
              <AdminTransferHistory />
            </ProtectedRoute>
          }
        />


        {/* =================================
            DISTRIBUTION MANAGER
        ================================= */}

        <Route
          path="/dashboard/distribution-manager"
          element={
            <ProtectedRoute
              allowedRoles={["DISTRIBUTION_MANAGER"]}
            >
              <DistributionManagerDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/distribution-manager/stock"
          element={
            <ProtectedRoute
              allowedRoles={["DISTRIBUTION_MANAGER"]}
            >
              <DistributionManagerStock />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/distribution-manager/receive-stock"
          element={
            <ProtectedRoute
              allowedRoles={["DISTRIBUTION_MANAGER"]}
            >
              <DistributionManagerReceiveStock />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/distribution-manager/transfer-stock"
          element={
            <ProtectedRoute
              allowedRoles={["DISTRIBUTION_MANAGER"]}
            >
              <DistributionManagerTransferStock />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/distribution-manager/low-stock"
          element={
            <ProtectedRoute
              allowedRoles={["DISTRIBUTION_MANAGER"]}
            >
              <DistributionManagerLowStock />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/distribution-manager/transactions"
          element={
            <ProtectedRoute
              allowedRoles={["DISTRIBUTION_MANAGER"]}
            >
              <DistributionManagerTransactions />
            </ProtectedRoute>
          }
        />


        {/* =================================
            ADMIN
        ================================= */}

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/referral-network"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminReferralNetwork />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/products"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/sales"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminSales />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminInventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/pending-cash-transfers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminPendingCashTransfers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/cash-transactions"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminCashTransactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/commissions"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminCommissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/admin-transfers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminTransfers />
            </ProtectedRoute>
          }
        />

      </Route>


      {/* =================================
          404
      ================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;
