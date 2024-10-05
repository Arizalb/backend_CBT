const mongoose = require("mongoose");

// Definisi schema untuk User
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama diperlukan"],
    },
    email: {
      type: String,
      required: [true, "Email diperlukan"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Harap masukkan email yang valid",
      ],
    },
    password: {
      type: String,
      required: [true, "Password diperlukan"],
    },
    role: {
      type: String,
      enum: ["admin", "examiner", "student"], // Hanya 3 jenis role yang diperbolehkan
      required: true,
      default: "student",
    },
  },
  {
    timestamps: true, // Secara otomatis akan menambahkan `createdAt` dan `updatedAt`
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
