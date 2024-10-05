const Result = require("../models/Result");
const Exam = require("../models/Exam");
const { default: mongoose } = require("mongoose");

const submitExam = async (req, res) => {
  try {
    const { examId, studentId, answers } = req.body; // Pastikan menerima struktur yang benar

    if (!examId || !studentId || !answers) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const result = new Result({
      examId,
      studentId,
      answers,
    });

    await result.save();
    res
      .status(201)
      .json({ message: "Jawaban ujian berhasil disimpan", result });
  } catch (error) {
    console.error("Error saat menyimpan hasil ujian:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error });
  }
};

// Mendapatkan daftar hasil ujian
const getResults = async (req, res) => {
  try {
    // Temukan semua hasil ujian
    const results = await Result.find();

    console.log("Query:", { query: "find all results" }); // Log query yang dijalankan

    console.log("Results:", results); // Log hasil query

    if (!results || results.length === 0) {
      if (!results) {
        return res
          .status(404)
          .json({ message: "Tidak ada hasil ujian yang ditemukan" });
      } else if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Tidak ada hasil ujian yang ditemukan" });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);

    // Jika ada kesalahan dalam proses populating data
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid request" });
    } else if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid request" });
    } else {
      return res.status(500).json({ message: "Server error" });
    }
  }
};

// Mendapatkan hasil ujian untuk siswa tertentu
const getResultByStudent = async (req, res) => {
  try {
    const { examId } = req.params;

    const result = await Result.findOne({
      exam: examId,
      student: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Hasil ujian tidak ditemukan" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error });
  }
};

// Mendapatkan semua hasil ujian berdasarkan ujian
// Controller untuk mendapatkan daftar hasil ujian
async function getResultsByExam(req, res) {
  try {
    // Temukan hasil ujian berdasarkan examId dan studentId
    const results = await Result.find({ examId: req.params.examId })
      .populate("student", "name email")
      .populate("exam", "title");

    console.log("Results:", results); // Log hasil query

    if (!results || results.length === 0) {
      if (!results) {
        return res.status(404).json({ message: "Hasil ujian tidak ditemukan" });
      } else if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Tidak ada hasil ujian yang ditemukan" });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching results by exam:", error);

    // Jika ada kesalahan dalam proses populating data
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid request" });
    } else if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid request" });
    } else {
      return res.status(500).json({ message: "Server error" });
    }
  }
}

// Pengawas menilai jawaban essay
const gradeEssayAnswers = async (req, res) => {
  const { resultId } = req.params;
  const { questionIndex, grade } = req.body; // Get the question index and grade

  try {
    // Fetch the result by ID
    const result = await Result.findById(resultId);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Ensure the question is of type "essay"
    if (result.answers[questionIndex].type !== "essay") {
      return res.status(400).json({ message: "This is not an essay question" });
    }

    // Update the essay grade
    result.answers[questionIndex].grade = grade;

    // Mark the result as checked
    result.isChecked = true;

    // Save the updated result
    await result.save();

    res.status(200).json({ message: "Essay graded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error grading essay" });
  }
};

// Endpoint untuk mendapatkan ujian yang sudah diselesaikan oleh student
const getCompletedExamsByStudent = async (req, res) => {
  try {
    const studentId = req.user._id; // Ambil studentId dari token pengguna yang sedang login

    // Validasi apakah studentId adalah valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Student ID tidak valid" });
    }

    // Cari semua hasil ujian yang telah diselesaikan oleh siswa ini
    const results = await Result.find({ studentId }).select("examId");

    // Ambil daftar examId dari hasil yang sudah ditemukan dan hapus duplikat menggunakan Set
    const uniqueExamIds = [...new Set(results.map((result) => result.examId))];

    console.log("Completed exams:", uniqueExamIds); // Log exam IDs for debugging

    res.status(200).json(uniqueExamIds); // Kembalikan array unik sebagai respons
  } catch (error) {
    console.error("Error fetching completed exams:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil ujian yang sudah diselesaikan" });
  }
};

// Mendapatkan hasil ujian berdasarkan ID
const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi apakah ID adalah valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    // Temukan hasil ujian berdasarkan ID
    const result = await Result.findById(id);

    console.log("Query:", { query: "find result by ID", id: id }); // Log query yang dijalankan

    console.log("Result:", result); // Log hasil query

    // Jika hasil tidak ditemukan
    if (!result) {
      return res.status(404).json({ message: "Hasil ujian tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching result by ID:", error);

    // Jika ada kesalahan dalam proses populating data
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID tidak valid" });
    } else if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Permintaan tidak valid" });
    } else {
      return res.status(500).json({ message: "Server error" });
    }
  }
};

const calculateMultipleChoiceMarks = (submittedAnswers, examQuestions) => {
  let totalMarks = 0;

  submittedAnswers.forEach((answer) => {
    if (answer.type === "multiple_choice") {
      const question = examQuestions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );

      if (question) {
        const correctAnswer = question.correctedAnswer; // Jawaban benar dari soal
        const selectedAnswer = answer.selectedAnswer;

        // Cocokkan jawaban yang dipilih dengan jawaban benar
        if (
          selectedAnswer === correctAnswer ||
          selectedAnswer === correctAnswer.position
        ) {
          totalMarks += question.marks; // Tambahkan nilai jika jawaban benar
        }
      }
    }
  });

  return totalMarks;
};

const calculateTotalMarks = async (examId, studentId) => {
  try {
    const exam = await Exam.findById(examId);
    const result = await Result.findOne({ examId, studentId });

    if (!exam || !result) {
      throw new Error("Exam or result not found");
    }

    const multipleChoiceMarks = calculateMultipleChoiceMarks(
      result.answers,
      exam.questions
    );

    // Total nilai saat ini hanya dari multiple-choice, essay dinilai nanti secara manual
    result.totalMarksObtained = multipleChoiceMarks;

    // Simpan hasil setelah perhitungan otomatis
    await result.save();

    return result;
  } catch (error) {
    throw new Error(`Error calculating total marks: ${error.message}`);
  }
};

// Endpoint untuk menghitung nilai setelah ujian selesai
const submitExamResult = async (req, res) => {
  const { examId, studentId } = req.body;

  try {
    const result = await calculateTotalMarks(examId, studentId);

    res.status(200).json({
      message: "Exam result submitted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  submitExam,
  getResults,
  getResultById,
  getResultByStudent,
  getResultsByExam,
  gradeEssayAnswers,
  getCompletedExamsByStudent,
  submitExamResult,
};
