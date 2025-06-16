const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Rute registrasi dengan validasi
router.post("/register", validateRegister, registerUser);

// Rute login dengan validasi
router.post("/login", validateLogin, loginUser);

// Rute untuk mendapatkan profil pengguna yang sudah login
router.get("/profile", protect, getUserProfile);

// Rute untuk memperbarui profil pengguna yang sudah login
router.put("/profile", protect, updateUserProfile);

// Rute lupa password
router.post("/forgot-password", forgotPassword);

// Rute reset password
router.put("/reset-password/:token", resetPassword);

module.exports = router;
