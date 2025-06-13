const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Untuk Vercel: tanpa `next()`, panggil sebagai fungsi biasa
const verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Tidak ada token" });
    throw new Error("Token not provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "Pengguna tidak ditemukan" });
      throw new Error("User not found");
    }

    req.user = user;
  } catch (err) {
    console.error("Token error:", err);
    res.status(401).json({ message: "Token tidak valid" });
    throw err;
  }
};

const verifyAdmin = async (req, res) => {
  if (!req.user) {
    res
      .status(401)
      .json({ message: "Akses ditolak. Tidak ada pengguna terautentikasi." });
    throw new Error("User not authenticated");
  }

  if (req.user.role !== "admin") {
    res
      .status(403)
      .json({ message: "Akses ditolak. Admin saja yang diperbolehkan." });
    throw new Error("User not admin");
  }
};

module.exports = { verifyToken, verifyAdmin };
