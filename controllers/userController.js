// controllers/userController.js
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get a user by ID
// @route   GET /api/users/:id
// @access  Private/Admin&Examiner
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await User.findByIdAndDelete(id);
    console.log(`User with ID ${id} deleted successfully`);
    res.json({ message: "User removed" });
  } catch (error) {
    console.error("Delete user error:", error.message, error.stack);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
};
