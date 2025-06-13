import dbConnect from "../../lib/dbConnect";
import {
  register,
  login,
  googleLogin,
  forgotCheck,
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../../controllers/authController";
import {
  updateProfile,
  setPhoneAndPassword,
} from "../../controllers/userController";
import { verifyToken } from "../../middleware/auth";

export default async function handler(req, res) {
  await dbConnect();

  const { url, method } = req;
  const path = url.split("?")[0]; // to ignore query string

  try {
    // REGISTER
    if (method === "POST" && path === "/api/auth/register") {
      return register(req, res);
    }

    // LOGIN
    if (method === "POST" && path === "/api/auth/login") {
      return login(req, res);
    }

    // GOOGLE LOGIN
    if (method === "POST" && path === "/api/auth/google-login") {
      return googleLogin(req, res);
    }

    // FORGOT PASSWORD STEP 1
    if (method === "POST" && path === "/api/auth/forgot-check") {
      return forgotCheck(req, res);
    }

    // FORGOT PASSWORD STEP 2
    if (method === "POST" && path === "/api/auth/send-otp") {
      return sendOtp(req, res);
    }

    // FORGOT PASSWORD STEP 3
    if (method === "POST" && path === "/api/auth/verify-otp") {
      return verifyOtp(req, res);
    }

    // RESET PASSWORD
    if (method === "POST" && path === "/api/auth/reset-password") {
      return resetPassword(req, res);
    }

    // SET PASSWORD (Google Login user)
    if (method === "PUT" && path === "/api/auth/set-password") {
      await verifyToken(req, res);
      return setPhoneAndPassword(req, res);
    }

    // UPDATE PROFILE
    if (method === "PUT" && path === "/api/auth/profile") {
      await verifyToken(req, res);
      return updateProfile(req, res);
    }

    return res.status(404).json({ message: "Endpoint tidak ditemukan" });
  } catch (error) {
    console.error("AUTH API ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
