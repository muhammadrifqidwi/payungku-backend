const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token tidak ditemukan atau format salah" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    req.user = user;

    console.log("Header:", authHeader);
    console.log("Decoded:", decoded);
    console.log("User found:", req.user);

    next();
  } catch (error) {
    console.error("VerifyToken Error:", error);
    return res.status(401).json({ message: "Token tidak valid" });
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
