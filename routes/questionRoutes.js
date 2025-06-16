const express = require("express");
const { getQuestions } = require("../controllers/questionController");
const { protect, admin, examiner } = require("../middleware/authMiddleware");
const router = express.Router();

// Rute untuk mendapatkan soal dengan pagination dan filtering
router.get("/", protect, admin, examiner, getQuestions);

module.exports = router;
