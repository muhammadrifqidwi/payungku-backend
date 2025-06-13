const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const OTP = require("../models/otp");
const {
  renderWelcomeEmail,
  renderResetPasswordEmail,
} = require("../utils/emailTemplates");
const transporter = require("../utils/nodemailer");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  const { name, phone, password, email } = req.body;
  try {
    const userExists = await User.findOne({ phone });
    if (userExists)
      return res.status(400).json({ message: "Nomor sudah terdaftar." });

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Email tidak valid." });
    }

    const user = await User.create({ name, phone, password, email });

    // Kirim email selamat datang
    await transporter.sendMail({
      from: `"PayungKu" <${process.env.EMAIL_SENDER}>`,
      to: user.email,
      subject: "Selamat Datang di PayungKu!",
      html: renderWelcomeEmail(user.name),
    });

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      token: generateToken(user),
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Gagal register", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: "Akun tidak ditemukan." });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      role: user.role,
      nama: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name,
        photo: picture,
        email,
        password: sub,
        role: "peminjam",
      });

      // Pengiriman email selamat datang
      await transporter.sendMail({
        from: `"PayungKu" <${process.env.EMAIL_SENDER}>`,
        to: email,
        subject: "Selamat Datang di PayungKu!",
        html: renderWelcomeEmail(name),
      });
    } else {
      if (!user.photo && picture) {
        user.photo = picture;
        await user.save();
      }
    }

    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token: appToken,
      role: user.role,
      nama: user.nama,
      phone: user.phone,
      photo: user.photo,
      password: user.password ? true : null,
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

exports.forgotCheck = async (req, res) => {
  const { input } = req.body; // bisa email atau phone

  console.log("Input masuk:", input);

  try {
    let user;

    if (input.includes("@")) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    console.log("Ditemukan user:", user);

    if (!user)
      return res.status(404).json({ message: "Akun tidak ditemukan." });

    const maskedEmail = user.email.replace(
      /(.{2}).+(@.+)/,
      (_, a, b) => a + "***" + b
    );

    console.log("Berhasil, kirim respon ke frontend.");

    return res.json({
      userId: user._id,
      email: user.email,
      maskedEmail,
    });
  } catch (err) {
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
      { email },
      { code: otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: `"PayungKu" <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: "Kode OTP Reset Password",
      html: renderResetPasswordEmail(otp),
    });

    return res.json({ message: "Kode OTP berhasil dikirim ke email" });
  } catch (err) {
    console.error("Gagal kirim OTP:", err);
    return res.status(500).json({ message: "Gagal mengirim OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  console.log("Verifikasi OTP untuk:", email, otp);

  if (!email || !otp) {
    return res.status(400).json({ message: "Email dan OTP harus diisi" });
  }

  const record = await OTP.findOne({ email });
  if (!record) {
    return res.status(400).json({ message: "Kode OTP tidak ditemukan" });
  }

  if (record.code !== otp) {
    return res.status(400).json({ message: "Kode OTP salah" });
  }

  await OTP.deleteOne({ email });
  return res.json({ message: "OTP valid" });
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password tidak valid." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const updated = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    return res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    console.error("Gagal reset password:", err);
    return res.status(500).json({ message: "Gagal mengubah password." });
  }
};
