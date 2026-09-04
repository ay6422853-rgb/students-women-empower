const Product = require("../models/Product");
const Category = require("../models/Category");
const Stock = require("../models/Stock");
const StockTransaction = require("../models/StockTransaction");
const User = require("../models/User");


// ======================================================
// HELPER - ADD STOCK TO USER
// ======================================================

async function addStockToUser(ownerId, productId, quantity) {

  let stock = await Stock.findOne({
    owner: ownerId
  });

  if (!stock) {

    stock = await Stock.create({
      owner: ownerId,
      items: []
    });

  }

  const item = stock.items.find(
    (item) =>
      String(item.product) === String(productId)
  );

  if (item) {

    item.quantity += quantity;

  } else {

    stock.items.push({
      product: productId,
      quantity
    });

  }

  await stock.save();

  return stock;
}


// ======================================================
// LIST PRODUCTS
// ======================================================

async function listProducts(req, res) {

  try {

    const products =
      await Product.find()
        .populate(
          "category",
          "name"
        )
        .sort({
          createdAt: -1
        });

    return res.json({
      products
    });

  } catch (error) {

    console.error(
      "List products error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load products"
    });

  }

}


// ======================================================
// CREATE PRODUCT
// ======================================================

async function createProduct(req, res) {

  try {

    const {
      name,
      description,
      category,
      price,
      sku,
      images,
      stock,
      lowStockThreshold,
      status
    } = req.body;


    // ==================================================
    // PRODUCT NAME
    // ==================================================

    if (
      !name ||
      name.trim() === ""
    ) {

      return res.status(400).json({
        message:
          "Product name is required"
      });

    }


    // ==================================================
    // PRICE
    // ==================================================

    if (
      price === undefined ||
      price === null ||
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {

      return res.status(400).json({
        message:
          "Valid product price is required"
      });

    }


    // ==================================================
    // STOCK
    // ==================================================

    const productStock =
      stock === undefined ||
      stock === null ||
      stock === ""
        ? 0
        : Number(stock);


    if (
      Number.isNaN(productStock) ||
      productStock < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid stock value"
      });

    }


    // ==================================================
    // LOW STOCK THRESHOLD
    // ==================================================

    const threshold =
      lowStockThreshold === undefined ||
      lowStockThreshold === null ||
      lowStockThreshold === ""
        ? 0
        : Number(lowStockThreshold);


    if (
      Number.isNaN(threshold) ||
      threshold < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid low stock threshold"
      });

    }


    // ==================================================
    // CREATE PRODUCT
    // ==================================================

    const product =
      await Product.create({

        name:
          name.trim(),

        description:
          description?.trim() || "",

        category:
          category || undefined,

        price:
          Number(price),

        sku:
          sku?.trim() || undefined,

        images:
          Array.isArray(images)
            ? images
            : [],

        stock:
          productStock,

        lowStockThreshold:
          threshold,

        status:
          status || "ACTIVE",

        createdBy:
          req.user.id

      });


    await product.populate(
      "category",
      "name"
    );


    return res.status(201).json({

      message:
        "Product created successfully",

      product

    });

  } catch (error) {

    console.error(
      "Create product error:",
      error
    );


    if (
      error.code === 11000
    ) {

      return res.status(400).json({
        message:
          "SKU already exists"
      });

    }


    return res.status(500).json({

      message:
        error.message ||
        "Unable to create product"

    });

  }

}


// ======================================================
// CREATE CATEGORY
// ======================================================

async function createCategory(req, res) {

  try {

    const {
      name,
      description
    } = req.body;


    if (
      !name ||
      name.trim() === ""
    ) {

      return res.status(400).json({

        message:
          "Category name is required"

      });

    }


    const category =
      await Category.create({

        name:
          name.trim(),

        description:
          description?.trim() || "",

        createdBy:
          req.user.id

      });


    return res.status(201).json({

      message:
        "Category created successfully",

      category

    });

  } catch (error) {

    console.error(
      "Create category error:",
      error
    );


    if (
      error.code === 11000
    ) {

      return res.status(400).json({

        message:
          "Category already exists"

      });

    }


    return res.status(500).json({

      message:
        error.message ||
        "Unable to create category"

    });

  }

}


// ======================================================
// LIST CATEGORIES
// ======================================================

async function listCategories(req, res) {

  try {

    const categories =
      await Category.find()
        .sort({
          name: 1
        });


    return res.json({
      categories
    });

  } catch (error) {

    console.error(
      "List categories error:",
      error
    );


    return res.status(500).json({

      message:
        "Unable to load categories"

    });

  }

}


// ======================================================
// UPDATE PRODUCT
// ======================================================

async function updateProduct(req, res) {

  try {

    const {
      name,
      description,
      category,
      price,
      sku,
      images,
      stock,
      lowStockThreshold,
      status
    } = req.body;


    const updateData = {};


    // ==================================================
    // NAME
    // ==================================================

    if (
      name !== undefined
    ) {

      if (
        typeof name !== "string" ||
        !name.trim()
      ) {

        return res.status(400).json({

          message:
            "Product name cannot be empty"

        });

      }


      updateData.name =
        name.trim();

    }


    // ==================================================
    // DESCRIPTION
    // ==================================================

    if (
      description !== undefined
    ) {

      updateData.description =
        String(description).trim();

    }


    // ==================================================
    // CATEGORY
    // ==================================================

    if (
      category !== undefined
    ) {

      updateData.category =
        category || null;

    }


    // ==================================================
    // PRICE
    // ==================================================

    if (
      price !== undefined
    ) {

      if (
        Number.isNaN(
          Number(price)
        ) ||
        Number(price) < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid price"

        });

      }


      updateData.price =
        Number(price);

    }


    // ==================================================
    // SKU
    // ==================================================

    if (
      sku !== undefined
    ) {

      updateData.sku =
        typeof sku === "string"
          ? sku.trim() || undefined
          : undefined;

    }


    // ==================================================
    // IMAGES
    // ==================================================

    if (
      images !== undefined
    ) {

      updateData.images =
        Array.isArray(images)
          ? images
          : [];

    }


    // ==================================================
    // COMPANY STOCK
    // ==================================================
    //
    // NOTE:
    // Stock add karne ke liye dedicated
    // addCompanyStock endpoint use karna better hai.
    //
    // Lekin existing product edit functionality
    // ko maintain kiya gaya hai.
    //
    // ==================================================

    if (
      stock !== undefined
    ) {

      const productStock =
        Number(stock);


      if (
        Number.isNaN(productStock) ||
        productStock < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid stock value"

        });

      }


      updateData.stock =
        productStock;

    }


    // ==================================================
    // LOW STOCK THRESHOLD
    // ==================================================

    if (
      lowStockThreshold !== undefined
    ) {

      const threshold =
        Number(
          lowStockThreshold
        );


      if (
        Number.isNaN(threshold) ||
        threshold < 0
      ) {

        return res.status(400).json({

          message:
            "Invalid low stock threshold"

        });

      }


      updateData.lowStockThreshold =
        threshold;

    }


    // ==================================================
    // STATUS
    // ==================================================

    if (
      status !== undefined
    ) {

      if (
        ![
          "ACTIVE",
          "INACTIVE"
        ].includes(status)
      ) {

        return res.status(400).json({

          message:
            "Invalid product status"

        });

      }


      updateData.status =
        status;

    }


    // ==================================================
    // UPDATE
    // ==================================================

    const product =
      await Product.findByIdAndUpdate(

        req.params.id,

        updateData,

        {
          new: true,
          runValidators: true
        }

      )
      .populate(
        "category",
        "name"
      );


    if (!product) {

      return res.status(404).json({

        message:
          "Product not found"

      });

    }


    return res.json({

      message:
        "Product updated successfully",

      product

    });

  } catch (error) {

    console.error(
      "Update product error:",
      error
    );


    if (
      error.code === 11000
    ) {

      return res.status(400).json({

        message:
          "SKU already exists"

      });

    }


    return res.status(500).json({

      message:
        error.message ||
        "Unable to update product"

    });

  }

}


// ======================================================
// ADD COMPANY STOCK
// ======================================================
//
// POST /api/products/:id/stock/add
//
// body:
//
// {
//   "quantity": 50,
//   "note": "New stock received"
// }
//
// Example:
//
// Existing Stock = 100
// Add Quantity   = 50
// New Stock      = 150
//
// ======================================================

async function addCompanyStock(req, res) {

  try {

    const {
      quantity,
      note
    } = req.body;


    const addQuantity =
      Number(quantity);


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !Number.isInteger(addQuantity) ||
      addQuantity <= 0
    ) {

      return res.status(400).json({

        message:
          "Stock quantity must be a positive whole number"

      });

    }


    // ==================================================
    // FIND PRODUCT
    // ==================================================

    const product =
      await Product.findById(
        req.params.id
      );


    if (!product) {

      return res.status(404).json({

        message:
          "Product not found"

      });

    }


    // ==================================================
    // CURRENT STOCK
    // ==================================================

    const oldStock =
      Number(
        product.stock || 0
      );


    // ==================================================
    // ADD STOCK
    // ==================================================

    product.stock =
      oldStock +
      addQuantity;


    await product.save();


    // ==================================================
    // TRANSACTION
    // ==================================================

    try {

      await StockTransaction.create({

        product:
          product._id,

        from:
          null,

        to:
          req.user.id,

        quantity:
          addQuantity,

        type:
          "STOCK_IN",

        note:
          note?.trim() ||
          "Company stock received"

      });

    } catch (transactionError) {

      console.error(
        "Stock transaction create error:",
        transactionError
      );

    }


    // ==================================================
    // UPDATED PRODUCT
    // ==================================================

    const updatedProduct =
      await Product.findById(
        product._id
      )
      .populate(
        "category",
        "name"
      );


    return res.json({

      message:
        "Company stock added successfully",

      addedQuantity:
        addQuantity,

      previousStock:
        oldStock,

      newStock:
        updatedProduct.stock,

      product:
        updatedProduct

    });

  } catch (error) {

    console.error(
      "Add company stock error:",
      error
    );


    return res.status(500).json({

      message:
        error.message ||
        "Unable to add company stock"

    });

  }

}


// ======================================================
// GET COMPANY STOCK
// ======================================================
//
// GET /api/products/stock
//
// ======================================================

async function getCompanyStock(req, res) {

  try {

    const products =
      await Product.find()
        .populate(
          "category",
          "name"
        )
        .select(
          "name sku price category stock lowStockThreshold status images"
        )
        .sort({
          name: 1
        });


    const totalStock =
      products.reduce(

        (total, product) =>

          total +
          Number(
            product.stock || 0
          ),

        0

      );


    const lowStockProducts =
      products.filter(

        (product) =>

          Number(
            product.stock || 0
          ) <=

          Number(
            product.lowStockThreshold || 0
          )

      );


    return res.json({

      products,

      summary: {

        totalProducts:
          products.length,

        totalStock,

        lowStockProducts:
          lowStockProducts.length

      }

    });

  } catch (error) {

    console.error(
      "Get company stock error:",
      error
    );


    return res.status(500).json({

      message:
        "Unable to load company stock"

    });

  }

}


// ======================================================
// GET DISTRIBUTION MANAGERS
// ======================================================
//
// Distribution Manager = Distributor
//
// GET /api/products/stock/distributors
//
// ======================================================

async function getDistributors(req, res) {

  try {

    const distributors =
      await User.find({

        role:
          "DISTRIBUTION_MANAGER",

        status:
          "ACTIVE"

      })
      .select(
        "name email phone city district state pincode role status"
      )
      .sort({
        name: 1
      });


    return res.json({

      count:
        distributors.length,

      distributors

    });

  } catch (error) {

    console.error(
      "Get distribution managers error:",
      error
    );


    return res.status(500).json({

      message:
        "Unable to load distribution managers"

    });

  }

}


// ======================================================
// COMPANY STOCK → DISTRIBUTION MANAGER
// ======================================================
//
// POST /api/products/stock/transfer
//
// body:
//
// {
//   "productId": "...",
//   "toUserId": "...",
//   "quantity": 20,
//   "note": "Monthly stock"
// }
//
// Example:
//
// Company Stock
// 100 → 80
//
// Distribution Manager Stock
// 10 → 30
//
// ======================================================

async function transferCompanyStock(req, res) {

  try {

    const {
      productId,
      toUserId,
      quantity,
      note
    } = req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !productId ||
      !toUserId ||
      quantity === undefined
    ) {

      return res.status(400).json({

        message:
          "productId, toUserId and quantity are required"

      });

    }


    const transferQuantity =
      Number(quantity);


    if (
      !Number.isInteger(
        transferQuantity
      ) ||
      transferQuantity <= 0
    ) {

      return res.status(400).json({

        message:
          "Transfer quantity must be a positive whole number"

      });

    }


    // ==================================================
    // FIND PRODUCT
    // ==================================================

    const product =
      await Product.findById(
        productId
      );


    if (!product) {

      return res.status(404).json({

        message:
          "Product not found"

      });

    }


    // ==================================================
    // FIND DISTRIBUTION MANAGER
    // ==================================================

    const distributor =
      await User.findOne({

        _id:
          toUserId,

        role:
          "DISTRIBUTION_MANAGER",

        status:
          "ACTIVE"

      });


    if (!distributor) {

      return res.status(400).json({

        message:
          "Active Distribution Manager not found"

      });

    }


    // ==================================================
    // COMPANY STOCK
    // ==================================================

    const companyStock =
      Number(
        product.stock || 0
      );


    if (
      companyStock <
      transferQuantity
    ) {

      return res.status(400).json({

        message:
          `Insufficient company stock. Available stock: ${companyStock}`

      });

    }


    // ==================================================
    // COMPANY STOCK MINUS
    // ==================================================

    product.stock =
      companyStock -
      transferQuantity;


    await product.save();


    // ==================================================
    // DISTRIBUTION MANAGER STOCK PLUS
    // ==================================================

    const distributorStock =
      await addStockToUser(

        distributor._id,

        product._id,

        transferQuantity

      );


    // ==================================================
    // TRANSACTION
    // ==================================================

    const transaction =
      await StockTransaction.create({

        product:
          product._id,

        from:
          req.user.id,

        to:
          distributor._id,

        quantity:
          transferQuantity,

        type:
          "COMPANY_TO_DISTRIBUTOR",

        note:
          note?.trim() ||
          "Company stock transferred to Distribution Manager"

      });


    // ==================================================
    // POPULATE TRANSACTION
    // ==================================================

    await transaction.populate(
      "product",
      "name sku price"
    );


    await transaction.populate(
      "from",
      "name email role"
    );


    await transaction.populate(
      "to",
      "name email role"
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({

      message:
        "Stock transferred to Distribution Manager successfully",

      transfer: {

        productId:
          product._id,

        productName:
          product.name,

        quantity:
          transferQuantity,

        distributor: {

          id:
            distributor._id,

          name:
            distributor.name,

          email:
            distributor.email,

          phone:
            distributor.phone

        },

        companyStockBefore:
          companyStock,

        companyStockAfter:
          product.stock

      },

      distributorStock:
        distributorStock,

      transaction

    });

  } catch (error) {

    console.error(
      "Transfer company stock error:",
      error
    );


    return res.status(500).json({

      message:
        error.message ||
        "Unable to transfer stock"

    });

  }

}


// ======================================================
// COMPANY STOCK TRANSACTION HISTORY
// ======================================================
//
// GET /api/products/stock/transactions
//
// ======================================================

async function companyStockTransactions(
  req,
  res
) {

  try {

    const transactions =
      await StockTransaction.find({

        $or: [

          {
            type:
              "STOCK_IN"
          },

          {
            type:
              "COMPANY_TO_DISTRIBUTOR"
          }

        ]

      })
      .populate(
        "product",
        "name sku price"
      )
      .populate(
        "from",
        "name email role"
      )
      .populate(
        "to",
        "name email role"
      )
      .sort({
        createdAt: -1
      });


    return res.json({

      count:
        transactions.length,

      transactions

    });

  } catch (error) {

    console.error(
      "Company stock transactions error:",
      error
    );


    return res.status(500).json({

      message:
        "Unable to load stock transactions"

    });

  }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  listProducts,

  createProduct,

  createCategory,

  listCategories,

  updateProduct,

  addCompanyStock,

  getCompanyStock,

  getDistributors,

  transferCompanyStock,

  companyStockTransactions

};