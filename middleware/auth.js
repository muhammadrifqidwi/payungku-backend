const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Tidak ada token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil user dari database, tanpa field password
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Token error:", err);
    res.status(401).json({ message: "Token tidak valid" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tidak ada pengguna terautentikasi." });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Admin saja yang diperbolehkan." });
  }

  next();
};

module.exports = { verifyToken, verifyAdmin };
