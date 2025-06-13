import dbConnect from "../lib/dbConnect";
import {
  createTransaction,
  confirmTransaction,
  returnTransaction,
  confirmReturn,
  handleLateReturnPayment,
  payPenalty,
  getUserTransactions,
  getTransactionById,
  deleteTransaction,
  getSnapToken,
  validateReturn,
} from "../controllers/transactionController";
import { verifyToken } from "../middleware/auth";

export default async function handler(req, res) {
  await dbConnect();
  const { action, token, id } = req.query;

  try {
    // POST Actions
    if (req.method === "POST") {
      if (!action)
        return res.status(400).json({ message: "Missing action query" });

      if (action === "rent") {
        await verifyToken(req, res);
        return createTransaction(req, res);
      }

      if (action === "confirm") {
        await verifyToken(req, res);
        return confirmTransaction(req, res);
      }

      if (action === "return") {
        await verifyToken(req, res);
        return returnTransaction(req, res);
      }

      if (action === "return-confirm") {
        return confirmReturn(req, res);
      }

      if (action === "return-late") {
        await verifyToken(req, res);
        return handleLateReturnPayment(req, res);
      }

      if (action === "penalty") {
        await verifyToken(req, res);
        return payPenalty(req, res);
      }

      if (action === "get-snap-token") {
        await verifyToken(req, res);
        return getSnapToken(req, res);
      }

      return res.status(404).json({ message: "Invalid action for POST" });
    }

    // GET Actions
    if (req.method === "GET") {
      if (action === "user") {
        await verifyToken(req, res);
        return getUserTransactions(req, res);
      }

      if (action === "return-validate" && token) {
        req.params = { token }; // optional if controller uses req.params
        return validateReturn(req, res);
      }

      if (action === "by-id" && id) {
        req.params = { id };
        return getTransactionById(req, res);
      }

      return res.status(404).json({ message: "Invalid action for GET" });
    }

    // DELETE
    if (req.method === "DELETE" && id) {
      req.params = { id };
      return deleteTransaction(req, res);
    }

    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("TRANSACTION API ERROR:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}
