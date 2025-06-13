const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");
const Transaction = require("../models/transaction");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

router.post("/notification", async (req, res) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);
    const { order_id, transaction_status } = statusResponse;

    // Mapping status Midtrans ke status transaksi internal
    let newStatus = "pending";
    if (transaction_status === "settlement") newStatus = "paid";
    else if (transaction_status === "expire" || transaction_status === "cancel")
      newStatus = "cancelled";

    // Update ke database
    await Transaction.findOneAndUpdate(
      { orderId: order_id },
      { paymentStatus: newStatus }
    );

    return res.status(200).json({ message: "Notifikasi diterima" });
  } catch (err) {
    console.error("Midtrans Notification Error:", err);
    return res.status(500).json({ message: "Gagal proses notifikasi" });
  }
});

module.exports = router;
