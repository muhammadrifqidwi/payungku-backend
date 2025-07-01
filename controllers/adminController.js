const User = require("../models/user");
const Transaction = require("../models/transaction");
const Location = require("../models/location");

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name email role updatedAt")
      .lean();

    res.json(users);
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name")
      .populate("location", "name")
      .select("status createdAt type location user")
      .lean();

    res.json(transactions);
  } catch (err) {
    console.error("Error getting transactions:", err);
    res.status(500).json({ message: "Gagal mengambil data transaksi" });
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    console.error("Error getting locations:", err);
    res.status(500).json({ message: "Gagal mengambil data lokasi" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const [totalUsers, totalAdmins, totalTransactions] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      Transaction.countDocuments(),
    ]);

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalTransactions,
    });
  } catch (err) {
    console.error("Error in getDashboardData:", err.message);
    return res.status(500).json({
      message: "Gagal mengambil data dashboard",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Format ID tidak valid." });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    res.json({
      message: "Pengguna berhasil dihapus.",
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus pengguna.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
