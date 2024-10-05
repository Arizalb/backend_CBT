const express = require("express");
const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
} = require("../controllers/examController");
const { protect, examiner } = require("../middleware/authMiddleware");
const {
  validateCreateExam,
  validateUpdateExam,
} = require("../validators/examValidator");
const router = express.Router();

// Rute untuk membuat ujian dengan validasi
router.post("/", protect, examiner, validateCreateExam, createExam);

// Rute untuk mendapatkan semua ujian
router.get("/", protect, getAllExams);

// Rute untuk mendapatkan ujian berdasarkan ID
router.get("/:id", protect, getExamById);

// Rute untuk mengupdate ujian dengan validasi
router.put("/:id", protect, examiner, validateUpdateExam, updateExam);

// Rute untuk menghapus ujian
router.delete("/:id", protect, examiner, deleteExam);

module.exports = router;
