const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Token tidak ditemukan atau format salah" });
    throw new Error("Token not provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) throw new Error("User not found");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token tidak valid" });
    throw error;
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
