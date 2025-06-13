const User = require("../models/user");
const Transaction = require("../models/transaction");
const Location = require("../models/Location");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data transaksi" });
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data lokasi" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalLocations = await Location.countDocuments();

    res.json({
      users: totalUsers,
      transactions: totalTransactions,
      locations: totalLocations,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data dashboard" });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalTransactions = await Transaction.countDocuments();

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("location", "name");

    const activeUsers = await User.find()
      .sort({ updatedAt: -1 })
      .limit(4)
      .select("name email updatedAt");

    const locations = await Location.find().limit(5);

    res.json({
      totalUsers,
      totalAdmins,
      totalTransactions,
      recentTransactions,
      activeUsers,
      locations,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data dashboard" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalTransactions = await Transaction.countDocuments();

    const users = await User.find().select("-password");
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name")
      .populate("location", "name");

    const recentTransactions = transactions.slice(0, 5);
    const activeUsers = users
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);

    const locations = await Location.find();

    res.json({
      totalUsers,
      totalAdmins,
      totalTransactions,
      recentTransactions,
      activeUsers,
      locations,
      users,
      transactions,
    });
  } catch (err) {
    console.error("Gagal mengambil data dashboard:", err);
    res.status(500).json({ message: "Gagal mengambil data dashboard" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    res.json({ message: "Pengguna berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus pengguna:", error.message);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menghapus pengguna." });
  }
};
