const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware untuk memverifikasi token JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Mendapatkan token dari header
      token = req.headers.authorization.split(" ")[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Mendapatkan user dari token yang sudah di-decode, tanpa menyertakan password
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Lanjut ke controller
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ message: "Tidak memiliki otorisasi, token tidak valid" });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ message: "Tidak memiliki otorisasi, tidak ada token" });
  }
};

// Middleware untuk mengecek role admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Jika role adalah admin, lanjut ke controller
  } else {
    res.status(403).json({ message: "Akses ditolak, hanya untuk admin" });
  }
};

// Middleware untuk mengecek role examiner
const examiner = (req, res, next) => {
  if (req.user && req.user.role === "examiner") {
    next(); // Jika role adalah examiner, lanjut ke controller
  } else {
    res.status(403).json({ message: "Akses ditolak, hanya untuk penguji" });
  }
};

module.exports = { protect, admin, examiner };
