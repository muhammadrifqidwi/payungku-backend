const User = require("../models/user");
const Transaction = require("../models/transaction");
const Location = require("../models/location");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("-password")
      .lean();
    res.json(users);
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("location", "name address")
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
    const summary = {
      totalUsers: 0,
      totalAdmins: 0,
      totalTransactions: 0,
      recentTransactions: [],
      activeUsers: [],
      locations: [],
      users: [],
      transactions: [],
    };

    // Step-by-step (sequential with try-catch each)
    try {
      summary.totalUsers = await User.countDocuments({ role: "user" });
    } catch (e) {
      console.error("Failed to count users:", e.message);
    }

    try {
      summary.totalAdmins = await User.countDocuments({ role: "admin" });
    } catch (e) {
      console.error("Failed to count admins:", e.message);
    }

    try {
      summary.totalTransactions = await Transaction.countDocuments();
    } catch (e) {
      console.error("Failed to count transactions:", e.message);
    }

    try {
      const users = await User.find()
        .select("-password")
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();
      summary.users = users;
      summary.activeUsers = users.slice(0, 4);
    } catch (e) {
      console.error("Failed to fetch users:", e.message);
    }

    try {
      const transactions = await Transaction.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("user", "name email")
        .populate("location", "name address")
        .lean();
      summary.transactions = transactions;
      summary.recentTransactions = transactions.slice(0, 5);
    } catch (e) {
      console.error("Failed to fetch transactions:", e.message);
    }

    try {
      summary.locations = await Location.find().select("name address").lean();
    } catch (e) {
      console.error("Failed to fetch locations:", e.message);
    }

    return res.status(200).json(summary);
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
