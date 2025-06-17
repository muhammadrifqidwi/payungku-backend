const User = require("../models/user");
const Transaction = require("../models/transaction");
const Location = require("../models/location");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().limit(10).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .populate("location", "name address")
      .limit(10)
      .sort({ createdAt: -1 });
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

exports.getDashboardStats = async (req, res) => {
  try {
    // Jalankan semua query secara parallel untuk performa lebih baik
    const [totalUsers, totalTransactions, totalLocations] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Location.countDocuments(),
    ]);

    res.json({
      users: totalUsers,
      transactions: totalTransactions,
      locations: totalLocations,
    });
  } catch (err) {
    console.error("Error getting dashboard stats:", err);
    res.status(500).json({ message: "Gagal mengambil data dashboard stats" });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    // Jalankan query secara parallel
    const [
      totalUsers,
      totalAdmins,
      totalTransactions,
      recentTransactions,
      activeUsers,
      locations,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      Transaction.countDocuments(),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .populate("location", "name address")
        .lean(), // gunakan lean() untuk performa lebih baik
      User.find({ role: "user" })
        .sort({ updatedAt: -1 })
        .limit(4)
        .select("name email updatedAt")
        .lean(),
      Location.find().limit(5).select("name address").lean(),
    ]);

    res.json({
      totalUsers,
      totalAdmins,
      totalTransactions,
      recentTransactions,
      activeUsers,
      locations,
    });
  } catch (err) {
    console.error("Error getting dashboard summary:", err);
    res.status(500).json({ message: "Gagal mengambil data dashboard summary" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const [
      userCount,
      adminCount,
      transactionCount,
      recentUsers,
      recentTransactions,
      locations,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      Transaction.countDocuments(),
      User.find().select("-password").sort({ updatedAt: -1 }).limit(100).lean(),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("user", "name email")
        .populate("location", "name address")
        .lean(),
      Location.find().select("name address").lean(),
    ]);

    const summary = {
      totalUsers: userCount,
      totalAdmins: adminCount,
      totalTransactions: transactionCount,
      recentTransactions: recentTransactions.slice(0, 5),
      activeUsers: recentUsers.slice(0, 4),
      locations,
      users: recentUsers,
      transactions: recentTransactions,
    };

    res.status(200).json(summary);
  } catch (err) {
    console.error("Error getting dashboard data:", err);
    res.status(500).json({
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

    // Optional: Hapus juga transaksi yang terkait dengan user ini
    // await Transaction.deleteMany({ user: id });

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
