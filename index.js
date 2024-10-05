const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const resultRoutes = require("./routes/resultRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Koneksi ke MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("CBT API is running...");
});

// Tambahkan rute autentikasi
app.use("/api/auth", authRoutes);
// Tambahkan rute ujian
app.use("/api/exams", examRoutes);
// Tambahkan rute hasil ujian
app.use("/api/results", resultRoutes);
// User Routes by Admin
app.use("/api/users", userRoutes);

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
