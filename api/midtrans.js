import midtransClient from "midtrans-client";
import dbConnect from "../lib/dbConnect";
import Transaction from "../models/transaction";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await dbConnect();

    const statusResponse = await snap.transaction.notification(req.body);
    const { order_id, transaction_status } = statusResponse;

    let newStatus = "pending";
    if (transaction_status === "settlement") newStatus = "paid";
    else if (transaction_status === "expire" || transaction_status === "cancel")
      newStatus = "cancelled";

    await Transaction.findOneAndUpdate(
      { orderId: order_id },
      { paymentStatus: newStatus }
    );

    return res.status(200).json({ message: "Notifikasi diterima" });
  } catch (err) {
    console.error("Midtrans Notification Error:", err);
    return res
      .status(500)
      .json({ message: "Gagal proses notifikasi", error: err.message });
  }
}
