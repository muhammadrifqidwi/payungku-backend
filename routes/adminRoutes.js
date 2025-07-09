const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllTransactions,
  getAllLocations,
  getDashboardData,
  deleteUser,
  deleteTransaction,
  deleteLocation,
} = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/dashboard/data", verifyToken, verifyAdmin, getDashboardData);
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/transactions", verifyToken, verifyAdmin, getAllTransactions);
router.get("/locations", verifyToken, verifyAdmin, getAllLocations);

router.delete("/users/:id", verifyToken, verifyAdmin, deleteUser);
router.delete("/transactions/:id", verifyToken, verifyAdmin, deleteTransaction);
router.delete("/locations/:id", verifyToken, verifyAdmin, deleteLocation);

module.exports = router;
