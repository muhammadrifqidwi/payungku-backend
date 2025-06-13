const router = require("express").Router();
const { register, login } = require("../controllers/authController");
const { updateProfile } = require("../controllers/userController");
const { googleLogin } = require("../controllers/authController");
const { setPhoneAndPassword } = require("../controllers/userController");
const {
  forgotCheck,
  sendOtp,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

router.put("/profile", verifyToken, updateProfile);
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.put("/set-password", verifyToken, setPhoneAndPassword);
router.post("/forgot-check", forgotCheck);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
