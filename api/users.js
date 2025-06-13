import dbConnect from "../lib/dbConnect";
import {
  register,
  login,
  changePassword,
  getProfile,
  getUserById,
  getAllUsers,
  updateProfile,
  deletePhoto,
} from "../controllers/userController";
import { verifyToken, verifyAdmin } from "../middleware/auth";

export default async function handler(req, res) {
  await dbConnect();
  const { path, id } = req.query;

  try {
    // POST
    if (req.method === "POST") {
      if (path === "register") return register(req, res);
      if (path === "login") return login(req, res);
      return res.status(404).json({ message: "Invalid POST path" });
    }

    // PUT
    if (req.method === "PUT") {
      if (path === "profile") {
        await verifyToken(req, res);
        // NOTE: skip file upload parsing; use cloud upload from frontend
        return updateProfile(req, res);
      }
      if (path === "change-password") {
        await verifyToken(req, res);
        return changePassword(req, res);
      }
      return res.status(404).json({ message: "Invalid PUT path" });
    }

    // GET
    if (req.method === "GET") {
      if (path === "me") {
        await verifyToken(req, res);
        return getProfile(req, res);
      }

      if (path === "admin-all") {
        await verifyToken(req, res);
        await verifyAdmin(req, res);
        return getAllUsers(req, res);
      }

      if (path === "by-id" && id) {
        req.params = { id };
        return getUserById(req, res);
      }

      return res.status(404).json({ message: "Invalid GET path" });
    }

    // DELETE
    if (req.method === "DELETE") {
      if (path === "photo") {
        await verifyToken(req, res);
        return deletePhoto(req, res);
      }
      return res.status(404).json({ message: "Invalid DELETE path" });
    }

    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("USER API ERROR:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}
