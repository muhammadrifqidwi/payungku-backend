const User = require("../models/user");
const Transaction = require("../models/transaction");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user profile", err });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", err });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const transactionCount = await Transaction.countDocuments({
      user: user._id,
    });

    const latestTransaction = await Transaction.findOne({ user: user._id })
      .sort({ createdAt: -1 })
      .select("createdAt");

    const lastTransaction = latestTransaction?.createdAt || null;

    res.json({
      ...user.toObject(),
      transactions: transactionCount,
      lastTransaction,
    });
  } catch (err) {
    console.error("Error getUserById:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone, photo } = req.body;
  const userId = req.user._id;

  try {
    const updateFields = { name, email, phone, photo: photo || "" };

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Profil berhasil diperbarui",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        photo: updatedUser.photo || "",
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err) {
    console.error("Gagal update profil:", err);
    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui profil",
    });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user._id; // dari middleware verifyToken
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Cari user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    // 2. Verifikasi password lama
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Kata sandi saat ini salah" });
    }

    // 3. Validasi panjang password baru (opsional)
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password baru minimal 6 karakter" });
    }

    // 4. Update password (akan otomatis di-hash via pre('save'))
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Kata sandi berhasil diubah" });
  } catch (err) {
    console.error("Gagal mengubah kata sandi:", err);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengubah kata sandi" });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    user.photo = "";
    await user.save();

    res.json({ message: "Foto profil berhasil dihapus" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menghapus foto", error: err.message });
  }
};

exports.setPhoneAndPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Nomor telepon dan password wajib diisi" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone && existingPhone._id.toString() !== userId) {
      return res.status(409).json({ message: "Nomor telepon sudah digunakan" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    user.phone = phone;
    user.password = password; // Ini akan otomatis di-hash oleh pre('save')
    await user.save();

    res.json({ message: "Nomor telepon dan password berhasil disimpan", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menyimpan data", error: err.message });
  }
};
