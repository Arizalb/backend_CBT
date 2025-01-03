const {
  createExamSchema,
  updateExamSchema,
} = require("../validators/examValidator");
const Exam = require("../models/Exam");

// Membuat ujian baru
const createExam = async (req, res) => {
  try {
    // Validasi data dengan Joi
    const { error } = createExamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, duration, totalMarks, questions, token } =
      req.body;

    const exam = new Exam({
      title,
      description,
      duration,
      totalMarks,
      questions,
      createdBy: req.user._id,
      token,
    });

    await exam.save();
    res.status(201).json({ message: "Ujian berhasil dibuat", exam });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Mendapatkan semua ujian
const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error });
  }
};

// Mendapatkan ujian berdasarkan ID
const getExamById = async (req, res) => {
  try {
    console.log(`Fetching exam with ID: ${req.params.id}`);
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      console.error(`Exam with ID ${req.params.id} not found`);
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    // Pisahkan soal multiple choice dan essay
    const multipleChoiceQuestions = exam.questions.filter(
      (q) => q.type === "multiple_choice"
    );
    const essayQuestions = exam.questions.filter((q) => q.type === "essay");

    // Fungsi untuk mengacak array
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Acak hanya soal multiple-choice
    const shuffledMultipleChoiceQuestions = shuffleArray(
      multipleChoiceQuestions
    );

    // Gabungkan kembali soal dengan urutan multiple-choice yang diacak
    const shuffledQuestions = [
      ...shuffledMultipleChoiceQuestions,
      ...essayQuestions,
    ];

    // Return soal yang diacak dan urutan asli
    res.status(200).json({
      ...exam.toObject(),
      questions: shuffledQuestions,
      originalOrder: exam.questions.map((q) => q._id), // Simpan ID urutan asli
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Memperbarui ujian
const updateExam = async (req, res) => {
  console.log("Request diterima untuk update exam:", req.body);

  try {
    // Validasi data dengan skema update
    const { error } = updateExamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, duration, totalMarks, token, questions } =
      req.body;

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    console.log("Exam ditemukan, memproses update...");

    exam.title = title || exam.title;
    exam.description = description || exam.description;
    exam.duration = duration || exam.duration;
    exam.totalMarks = totalMarks || exam.totalMarks;
    exam.token = token || exam.token;

    // Update `questions` hanya jika diberikan
    if (questions && questions.length > 0) {
      exam.questions = questions;
    }

    await exam.save();
    res.status(200).json({ message: "Ujian berhasil diperbarui", exam });
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error });
  }
};

// Menghapus ujian
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deleting exam with ID: ${id}`);

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    console.log(`Exam found: ${exam}`);

    await Exam.findByIdAndDelete(id);

    console.log("Exam deleted successfully");

    return res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Failed to delete exam:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Validasi token ujian
const validateExamToken = async (req, res) => {
  const { id, token } = req.body;
  try {
    const exam = await Exam.findById(id);
    if (exam && exam.token === token) {
      res.status(200).json({ isValid: true });
    } else {
      res.status(401).json({ isValid: false, message: "Invalid token" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  validateExamToken,
};
