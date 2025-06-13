import dbConnect from "../lib/dbConnect";
import {
  login,
  register,
  forgotCheck,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleLogin,
  setPhoneAndPassword,
} from "../controllers/authController";
import { verifyToken } from "../middleware/auth";

export default async function handler(req, res) {
  await dbConnect();

  const { method, url } = req;

  // Bersihkan path agar hanya /login, /register, dst.
  const path = url.split("/api/auth")[1].split("?")[0];

  try {
    if (method === "POST" && path === "/login") {
      return login(req, res);
    }

    if (method === "POST" && path === "/register") {
      return register(req, res);
    }

    if (method === "POST" && path === "/google-login") {
      return googleLogin(req, res);
    }

    if (method === "POST" && path === "/forgot-check") {
      return forgotCheck(req, res);
    }

    if (method === "POST" && path === "/send-otp") {
      return sendOtp(req, res);
    }

    if (method === "POST" && path === "/verify-otp") {
      return verifyOtp(req, res);
    }

    if (method === "POST" && path === "/reset-password") {
      return resetPassword(req, res);
    }

    if (method === "PUT" && path === "/set-password") {
      return verifyToken(req, res, () => setPhoneAndPassword(req, res));
    }

    // Fallback jika path tidak ditemukan
    return res
      .status(404)
      .json({ message: `Endpoint ${path} tidak ditemukan.` });
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}
