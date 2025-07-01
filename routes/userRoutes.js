const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const {
  updateProfile,
  getProfile,
  changePassword,
  getUserById,
  getAllUsers,
  deletePhoto,
} = require("../controllers/userController");
const upload = require("../middleware/upload");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);

router.put("/profile", verifyToken, upload.single("photo"), updateProfile);
router.put("/change-password", verifyToken, changePassword);

router.get("/me", verifyToken, getProfile);
router.get("/:id", getUserById);
router.get("/all-users", verifyToken, verifyAdmin, getAllUsers);

router.delete("/photo", verifyToken, deletePhoto);
module.exports = router;
