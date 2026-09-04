require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


const adminRoutes =
  require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const stockRoutes = require("./routes/stockRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const walletRoutes = require("./routes/walletRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const cashRoutes = require("./routes/cashRoutes");
const cashManagerRoutes = require("./routes/cashManagerRoutes");
const teamLeaderRoutes = require("./routes/teamLeaderRoutes");
const ctoRoutes = require("./routes/ctoRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Students and Women Empower backend is running"
  });
});


app.use(
  "/api/admin",
  adminRoutes
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/cash-manager", cashManagerRoutes);
app.use("/api/team-leader", teamLeaderRoutes);
app.use("/api/cto", ctoRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error"
  });
});

// ONLY ONE app.listen()
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});