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
} = require("../controllers/resultController");
const { protect, examiner } = require("../middleware/authMiddleware");
const router = express.Router();

// Siswa mengirimkan jawaban ujian
router.post("/submit/:examId", protect, submitExam);

// Siswa mendapatkan hasil ujian
router.get("/student/:examId", protect, getResultByStudent);

// Pengawas mendapatkan semua hasil ujian
router.get("/exam/:examId", protect, examiner, getResultsByExam);

// mendapatkan daftar jawaban ujian
router.get("/", protect, examiner, getResults);

// Endpoint untuk mendapatkan ujian yang sudah diselesaikan oleh student
router.get("/completed-exams", protect, getCompletedExamsByStudent);

// mendapatkan daftar jawaban ujian berdasarkan Id
router.get("/:id", protect, examiner, getResultById);

// Pengawas menilai jawaban essay
router.put(
  "/grade/:resultId",
  protect,
  examiner,
  gradeEssayAnswers,
  submitExamResult
);
router.post("/grade/:resultId", protect, examiner, submitExamResult);

module.exports = router;
