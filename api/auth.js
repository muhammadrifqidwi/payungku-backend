import dbConnect from "../lib/dbConnect";
import {
  register,
  login,
  googleLogin,
  forgotCheck,
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../controllers/authController";
import {
  updateProfile,
  setPhoneAndPassword,
} from "../controllers/userController";
import { verifyToken } from "../middleware/auth";

export default async function handler(req, res) {
  await dbConnect();
  const { path } = req.query;

  try {
    if (req.method === "POST") {
      switch (path) {
        case "register":
          return register(req, res);
        case "login":
          return login(req, res);
        case "google-login":
          return googleLogin(req, res);
        case "forgot-check":
          return forgotCheck(req, res);
        case "send-otp":
          return sendOtp(req, res);
        case "verify-otp":
          return verifyOtp(req, res);
        case "reset-password":
          return resetPassword(req, res);
        default:
          return res.status(404).json({ message: "Invalid POST path" });
      }
    }

    if (req.method === "PUT") {
      if (path === "profile") {
        await verifyToken(req, res);
        return updateProfile(req, res);
      }

      if (path === "set-password") {
        await verifyToken(req, res);
        return setPhoneAndPassword(req, res);
      }

      return res.status(404).json({ message: "Invalid PUT path" });
    }

    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
