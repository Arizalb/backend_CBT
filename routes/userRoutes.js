// routes/userRoutes.js
const express = require("express");
const {
  getAllUsers,
  deleteUser,
  getUserById,
} = require("../controllers/userController");
const { protect, admin, examiner } = require("../middleware/authMiddleware");

const router = express.Router();

// GET all users (admin only)
router.get("/", protect, admin, getAllUsers);

// GET user by Id (examiner or admin)
router.get("/:id", protect, examiner, getUserById);

// DELETE user by ID (admin only)
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
