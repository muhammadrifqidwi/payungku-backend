const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

// Middleware untuk verifikasi token JWT
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token tidak ditemukan atau format salah" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({ message: "ID token tidak valid" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("VerifyToken Error:", error.message);
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

const verifyAdmin = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Pengguna belum login." });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya admin yang diperbolehkan." });
  }

  next();
};

module.exports = { verifyToken, verifyAdmin };
