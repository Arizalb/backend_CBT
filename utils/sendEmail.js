const nodemailer = require("nodemailer");
const User = require("../models/User"); // Pastikan path ke model User benar

// Buat transporter untuk mengirim email
const transporter = nodemailer.createTransport({
  host: "bulk.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USER, // Ganti dengan Mailtrap user dari .env
    pass: process.env.MAILTRAP_PASS, // Ganti dengan Mailtrap pass dari .env
  },
});

// Fungsi untuk mengirim email dengan mengambil email user dari database
const sendEmail = async (studentId, subject, text) => {
  try {
    // Log untuk mengecek nilai studentId
    console.log("studentId:", studentId);

    // Cari user berdasarkan studentId untuk mendapatkan email
    const user = await User.findById(studentId);

    // Log untuk memastikan user ditemukan
    console.log("Pengguna ditemukan:", user);

    // Validasi apakah user ditemukan dan memiliki email
    if (!user || !user.email) {
      throw new Error("Pengguna tidak ditemukan atau email tidak tersedia");
    }

    // Opsi email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Alamat pengirim
      to: user.email, // Alamat email pengguna
      subject: subject,
      text: text,
    };

    // Mengirim email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error: ", error.message);
  }
};

module.exports = sendEmail;
