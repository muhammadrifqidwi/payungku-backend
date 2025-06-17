const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllTransactions,
  getAllLocations,
  getDashboardStats,
  getDashboardSummary,
  getDashboardData,
  deleteUser,
} = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// Konfigurasi CORS khusus route ini
const corsOptions = {
  origin: ["http://localhost:5173", "https://payungku.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware CORS hanya untuk route admin
router.use(cors(corsOptions));
router.options("*", cors(corsOptions)); // preflight

router.get("/dashboard/data", verifyToken, verifyAdmin, getDashboardData);
router.get("/dashboard/stats", verifyToken, verifyAdmin, getDashboardStats);
router.get("/dashboard/summary", verifyToken, verifyAdmin, getDashboardSummary);
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/transactions", verifyToken, verifyAdmin, getAllTransactions);
router.get("/locations", verifyToken, verifyAdmin, getAllLocations);

router.delete("/users/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;
