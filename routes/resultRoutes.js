const express = require("express");
const {
  submitExam,
  getResultByStudent,
  getResultsByExam,
  gradeEssayAnswers,
  getCompletedExamsByStudent,
  getResults,
  getResultById,
  submitExamResult,
  getResultDetailByStudent,
  deleteAllResults,
} = require("../controllers/resultController");
const { protect, examiner, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// Siswa mengirimkan jawaban ujian
router.post("/submit/:examId", protect, submitExam);

// Siswa mendapatkan hasil ujian
router.get("/student/:examId", protect, getResultByStudent);

// Siswa mendapatkan hasil ujian
router.get("/student/:examId/detail", protect, getResultDetailByStudent);

// Pengawas mendapatkan semua hasil ujian
router.get("/exam/:examId", protect, examiner, getResultsByExam);

// mendapatkan daftar jawaban ujian
router.get("/", protect, examiner, getResults);

// Endpoint untuk mendapatkan ujian yang sudah diselesaikan oleh student
router.get("/completed-exams", protect, getCompletedExamsByStudent);

// mendapatkan daftar jawaban ujian berdasarkan Id
router.get("/:id", protect, examiner, getResultById);

// Pengawas menilai jawaban essay
router.put("/grade/:resultId", protect, examiner, gradeEssayAnswers);

// Pengawas mengirimkan hasil ujian dan menghitung nilai akhir
router.post("/grade/:resultId/finalize", protect, examiner, submitExamResult);

router.post("/grade/:resultId", protect, examiner, submitExamResult);

// Admin menghapus semua hasil ujian
router.delete("/delete-all", protect, admin, deleteAllResults);

module.exports = router;
