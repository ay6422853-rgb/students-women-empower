
const router =
  require("express").Router();

const auth =
  require("../middleware/authMiddleware");

const allowRoles =
  require("../middleware/roleMiddleware");

const productController =
  require("../controllers/productController");


// ======================================================
// AUTHENTICATION
// ======================================================

router.use(auth);


// ======================================================
// PRODUCTS
// ======================================================

// ------------------------------------------------------
// LIST PRODUCTS
// ------------------------------------------------------

router.get(
  "/",
  productController.listProducts
);


// ------------------------------------------------------
// CREATE PRODUCT
// ------------------------------------------------------

router.post(
  "/",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.createProduct
);


// ------------------------------------------------------
// UPDATE PRODUCT
// ------------------------------------------------------

router.patch(
  "/:id",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.updateProduct
);


// ======================================================
// CATEGORIES
// ======================================================

// ------------------------------------------------------
// LIST CATEGORIES
// ------------------------------------------------------

router.get(
  "/categories",
  productController.listCategories
);


// ------------------------------------------------------
// CREATE CATEGORY
// ------------------------------------------------------

router.post(
  "/categories",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.createCategory
);


// ======================================================
// COMPANY STOCK
// ======================================================

// ------------------------------------------------------
// GET COMPANY STOCK
// ------------------------------------------------------

router.get(
  "/stock",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.getCompanyStock
);


// ======================================================
// ADD COMPANY STOCK
// ======================================================
//
// Existing stock me quantity ADD hogi.
//
// Example:
//
// 100 + 50 = 150
//
// ======================================================

router.post(
  "/:id/stock/add",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.addCompanyStock
);


// ======================================================
// ACTIVE DISTRIBUTION MANAGERS
// ======================================================
//
// IMPORTANT:
//
// Distributor = DISTRIBUTION_MANAGER
//
// ======================================================

router.get(
  "/stock/distributors",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.getDistributors
);


// ======================================================
// COMPANY → DISTRIBUTION MANAGER
// ======================================================
//
// Company stock minus
//
// Distribution Manager stock plus
//
// ======================================================

router.post(
  "/stock/transfer",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.transferCompanyStock
);


// ======================================================
// STOCK TRANSACTION HISTORY
// ======================================================

router.get(
  "/stock/transactions",
  allowRoles(
    "PRODUCT_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  productController.companyStockTransactions
);


module.exports =
  router;