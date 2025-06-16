const Transaction = require("../models/transaction");
const User = require("../models/user");
const Location = require("../models/location");
const midtransClient = require("midtrans-client");
const crypto = require("crypto");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

function generateLockerCode() {
  const row = String.fromCharCode(65 + Math.floor(Math.random() * 5)); // A-E
  const num = String(Math.floor(Math.random() * 20)).padStart(2, "0");
  return `${row}-${num}`;
}

function generateCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

const maxRentDurationTime = () => {
  const now = new Date();

  const end = new Date(now);
  end.setHours(19, 0, 0, 0);

  if (now >= end) return 10;

  const diffMs = end - now;
  const durationMinutes = Math.floor(diffMs / (1000 * 60));
  return durationMinutes;
};

exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { locationId } = req.body;
    if (!locationId) {
      return res.status(400).json({ message: "Lokasi tidak dikirim." });
    }

    const lockerCode = generateLockerCode();
    console.log("Generated lockerCode:", generateLockerCode());
    const rentCode = generateCode();
    console.log("Generated Rent Code:", rentCode);
    const rentDuration = maxRentDurationTime();
    console.log("Rent Duration:", rentDuration);

    const fullUser = await User.findById(userId);
    if (!fullUser)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const orderId = `PAYUNG-${Date.now()}`;
    const totalPayment = 12000;

    const newTrx = await Transaction.create({
      user: userId,
      location: locationId,
      orderId,
      totalPayment,
      rentCode,
      lockerCode,
      paymentStatus: "pending",
      status: "active",
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPayment,
      },
      customer_details: {
        first_name: fullUser.name,
        phone: fullUser.phone,
      },
      callbacks: {
        finish: "https://payungku.vercel.app/dashboard",
        error: "https://payungku.vercel.app/payment/error",
      },
    };

    const midtransRes = await snap.createTransaction(parameter);

    res.json({
      snapToken: midtransRes.token,
      transactionId: newTrx._id,
    });
  } catch (err) {
    console.error("Create Transaction Error:", err);
    res.status(500).json({ message: "Gagal membuat transaksi" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name phone")
      .populate("location", "name address");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil transaksi" });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ user: userId })
      .populate("location", "name")
      .populate("returnLocation", "name")
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil riwayat transaksi" });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const trx = await Transaction.findById(req.params.id)
      .populate("user", "name")
      .populate("location", "name address")
      .populate("returnLocation", "name address");

    if (!trx) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json(trx);
  } catch (err) {
    console.error("Get Transaction Error:", err);
    res.status(500).json({ message: "Gagal mengambil detail transaksi" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus transaksi" });
  }
};

exports.getSnapToken = async (req, res) => {
  try {
    const { locationId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const orderId = `PAYUNG-${Date.now()}`;
    const totalPayment = 12000;

    // Buat transaksi pending di database
    const trx = await Transaction.create({
      user: userId,
      location: locationId,
      orderId,
      totalPayment,
      rentCode: generateCode(),
      status: "pending",
      paymentStatus: "pending",
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPayment,
      },
      customer_details: {
        first_name: user.name,
        phone: user.phone,
      },
      callbacks: {
        finish: "https://payungku.vercel.app/dashboard",
        error: "https://payungku.vercel.app/payment/error",
      },
    };

    const midtransRes = await snap.createTransaction(parameter);

    // Simpan token ke transaksi yang sudah dibuat
    trx.snapToken = midtransRes.token;
    await trx.save();

    res.json({
      snapToken: midtransRes.token,
      orderId,
      totalPayment,
    });
  } catch (err) {
    console.error("Get SnapToken Error:", err);
    res.status(500).json({ message: "Gagal membuat Snap Token" });
  }
};

exports.confirmTransaction = async (req, res) => {
  try {
    const { orderId, paymentResult } = req.body;
    const userId = req.user.id;

    const trx = await Transaction.findOne({ orderId, user: userId });
    if (!trx) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    trx.paymentStatus = "paid";
    trx.status = "active";
    trx.rentCode = generateCode();
    trx.lockerCode = generateLockerCode();
    trx.createdAt = new Date(); // update waktu peminjaman
    trx.paymentResult = paymentResult; // opsional untuk disimpan
    trx.token = crypto.randomBytes(16).toString("hex");
    trx.tokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    trx.paymentResult = {
      ...paymentResult,
      snapToken: paymentResult.snapToken || trx.snapToken || null,
    };

    await trx.save();
    const fullTrx = await Transaction.findById(trx._id);

    // Kurangi stok payung di lokasi
    await Location.findByIdAndUpdate(trx.location, { $inc: { stock: -1 } });

    res.json({
      message: "Transaksi berhasil dikonfirmasi",
      transaction: fullTrx,
    });
  } catch (err) {
    console.error("Confirm Error:", err);
    res.status(500).json({ message: "Gagal menyimpan transaksi" });
  }
};

exports.returnTransaction = async (req, res) => {
  try {
    const { rentCode, token, returnLocationId } = req.body;
    const userId = req.user.id;

    const trx = await Transaction.findOne({
      $or: [{ rentCode }, { token }],
      user: userId,
      status: "active",
      paymentStatus: "paid",
    }).populate("user");

    if (!trx) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan atau sudah dikembalikan",
      });
    }

    const now = new Date();
    const rentTime = trx.createdAt;
    const diffMs = now - rentTime;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const gracePeriod = 60;
    const lateMinutes = totalMinutes - gracePeriod;

    const returnLockerCode = generateLockerCode();
    trx.returnLockerCode = returnLockerCode;
    trx.returnLocation = returnLocationId;
    trx.returnTime = now;

    const rentDuration = `${Math.floor(totalMinutes / 60)} jam ${
      totalMinutes % 60
    } menit`;

    if (lateMinutes > 0) {
      const fine = Math.ceil(lateMinutes / 30) * 2000;
      trx.status = "late";
      trx.penaltyAmount = fine;
      trx.penaltyStatus = "pending";
      trx.penaltyOrderId = `DENDA-${trx._id}-${Date.now()}`;

      const midtransClient = require("midtrans-client");
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      const midtransRes = await snap.createTransaction({
        transaction_details: {
          order_id: trx.penaltyOrderId,
          gross_amount: fine,
        },
        customer_details: {
          first_name: trx.user?.name || "Pengguna",
          phone: trx.user?.phone || "",
        },
        callbacks: {
          finish: "https://payungku.vercel.app/transaksi?status=denda-berhasil",
        },
      });

      await trx.save();
      await Location.findByIdAndUpdate(returnLocationId, {
        $inc: { stock: 1 },
      });

      return res.json({
        status: "late",
        denda: fine,
        returnLockerCode,
        rentDuration,
        snapToken: midtransRes.token,
      });
    }

    trx.status = "returned";
    trx.token = null;
    trx.penaltyStatus = "none";
    await trx.save();
    await Location.findByIdAndUpdate(returnLocationId, { $inc: { stock: 1 } });

    return res.json({
      status: "returned",
      returnLockerCode,
      rentDuration,
    });
  } catch (err) {
    console.error("Return Error:", err);
    return res.status(500).json({ message: "Gagal memproses pengembalian" });
  }
};

exports.validateReturn = async (req, res) => {
  const { token } = req.params;
  const locationId = req.query.locationId;

  try {
    const transaction = await Transaction.findOne({ token, status: "active" })
      .populate("user")
      .populate("location");

    if (!transaction) {
      return res.status(404).json({
        valid: false,
        message: "Token tidak valid atau transaksi sudah selesai.",
      });
    }

    // Cek apakah token sudah expired (lebih dari 5 menit)
    const now = new Date();
    const tokenExpiry = transaction.tokenExpiresAt || transaction.createdAt;
    const expired = now - new Date(tokenExpiry) > 5 * 60 * 1000;

    if (expired) {
      // Buat token baru dan simpan
      const newToken = crypto.randomBytes(16).toString("hex");
      transaction.token = newToken;
      transaction.tokenExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
      await transaction.save();

      return res.json({
        refreshed: true,
        message: "Token lama sudah kedaluwarsa. Token baru telah dibuat.",
        newToken: newToken,
        valid: false,
      });
    }

    // (1) Validasi lokasi
    if (locationId && transaction.returnLocation.toString() !== locationId) {
      return res.status(400).json({
        valid: false,
        message: "Anda tidak berada di lokasi pengembalian yang benar.",
      });
    }

    // (2) Cek keterlambatan
    const borrowTime = new Date(transaction.borrowTime);
    const deadline = new Date(
      borrowTime.getTime() + transaction.duration * 60000
    );
    const isLate = now > deadline;
    const lateMinutes = isLate ? Math.floor((now - deadline) / 60000) : 0;

    const penaltyAmount = lateMinutes * 500; // misalnya Rp500 per menit

    if (isLate) {
      // buat snapToken jika belum ada
      let snapToken = transaction.snapToken;
      if (!snapToken) {
        const midtransSnap = new midtransClient.Snap({
          isProduction: false,
          serverKey: process.env.MIDTRANS_SERVER_KEY,
        });

        const parameter = {
          transaction_details: {
            order_id: `penalty-${Date.now()}`,
            gross_amount: penaltyAmount,
          },
          credit_card: {
            secure: true,
          },
        };

        const snap = await midtransSnap.createTransaction(parameter);
        snapToken = snap.token;
      }

      return res.json({
        valid: true,
        isLate: true,
        denda: penaltyAmount,
        snapToken,
        transaction,
        user: transaction.user,
      });
    }

    // Jika tidak telat
    return res.json({
      valid: true,
      isLate: false,
      transaction,
      user: transaction.user,
    });
  } catch (err) {
    console.error("❌ Error validasi:", err);
    res
      .status(500)
      .json({ valid: false, message: "Terjadi kesalahan server." });
  }
};

exports.handleLateReturnPayment = async (req, res) => {
  try {
    res.json({ message: "Pembayaran denda berhasil diproses" });
  } catch (err) {
    console.error("Late Return Payment Error:", err);
    res.status(500).json({ message: "Gagal memproses denda keterlambatan" });
  }
};

exports.confirmReturn = async (req, res) => {
  try {
    const { transactionId, returnLocationId } = req.body;

    const trx = await Transaction.findById(transactionId);
    if (!trx || trx.status === "returned") {
      return res
        .status(404)
        .json({ message: "Transaksi tidak ditemukan atau sudah dikembalikan" });
    }

    trx.status = "returned";
    trx.token = null;
    trx.returnLocation = returnLocationId;
    trx.returnTime = new Date();
    await trx.save();
    const fullTrx = await Transaction.findById(trx._id);

    res.json({
      message: "Pengembalian berhasil dikonfirmasi",
      returnCode: trx.returnCode,
    });
  } catch (err) {
    console.error("Confirm Return Error:", err);
    res.status(500).json({ message: "Gagal mengonfirmasi pengembalian" });
  }
};

exports.payPenalty = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const trx = await Transaction.findById(transactionId).populate("user");

    if (!trx || trx.status !== "active" || trx.paymentStatus !== "paid") {
      return res
        .status(404)
        .json({ message: "Transaksi tidak valid atau sudah dikembalikan" });
    }

    const now = new Date();
    const diff = now - trx.createdAt;
    const lateMinutes = Math.floor(diff / (1000 * 60)) - 60;

    if (lateMinutes <= 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada denda yang perlu dibayar" });
    }

    const totalPenalty = Math.ceil(lateMinutes / 30) * 2000;

    const orderId = `DENDA-${trx._id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPenalty,
      },
      customer_details: {
        first_name: trx.user.name || "Pengguna",
        phone: trx.user.phone || "",
      },
      callbacks: {
        finish: "https://payungku.vercel.app/pengembalian/sukses",
      },
    };

    const midtransRes = await snap.createTransaction(parameter);

    trx.penaltyOrderId = orderId;
    trx.penaltyAmount = totalPenalty;
    trx.penaltyStatus = "pending";
    await trx.save();
    const fullTrx = await Transaction.findById(trx._id);

    res.json({
      snapToken: midtransRes.token,
      amount: totalPenalty,
      message: "Denda berhasil dibuat",
    });
  } catch (err) {
    console.error("Pay Penalty Error:", err);
    res.status(500).json({ message: "Gagal memproses pembayaran denda" });
  }
};
