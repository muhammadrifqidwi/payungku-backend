import dbConnect from "../lib/dbConnect";
import {
  getAllUsers,
  getAllTransactions,
  getAllLocations,
  getDashboardStats,
  getDashboardSummary,
  getDashboardData,
  deleteUser,
} from "../controllers/adminController";
import { verifyToken, verifyAdmin } from "../middleware/auth";

export default async function handler(req, res) {
  console.log("Connecting DB...");
  await dbConnect();

  console.log("Verifying token...");
  await verifyToken(req, res);

  console.log("Verifying admin...");
  await verifyAdmin(req, res);

  const { path, id } = req.query;
  console.log("Path:", path);

  if (req.method === "GET") {
    switch (path) {
      case "dashboard":
        return getDashboardData(req, res);
      case "dashboard-stats":
        return getDashboardStats(req, res);
      case "dashboard-summary":
        return getDashboardSummary(req, res);
      case "users":
        console.log("Calling getAllUsers...");
        return getAllUsers(req, res);
      case "transactions":
        return getAllTransactions(req, res);
      case "locations":
        return getAllLocations(req, res);
      default:
        return res.status(404).json({ message: "Invalid path" });
    }
  }

  if (req.method === "DELETE") {
    if (path === "users" && id) {
      req.params = { id };
      return deleteUser(req, res);
    } else {
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
}
