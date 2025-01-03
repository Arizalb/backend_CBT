const Result = require("../models/Result");
const Exam = require("../models/Exam");
const { default: mongoose } = require("mongoose");
const sendEmail = require("../utils/sendEmail");

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
    const userId = req.user._id;

    console.log("Exam ID:", examId);
    console.log("User ID:", userId);

    // Revisi query untuk menggunakan bidang yang benar (examId dan studentId)
    const result = await Result.findOne({
      examId,
      studentId: userId,
    }).lean(); // Gunakan .lean() untuk logging hasil

    if (!result) {
      return res.status(404).json({ message: "Hasil ujian tidak ditemukan" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching result:", error);

    // Respon status 500 dengan informasi kesalahan
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
  const { resultId } = req.params; // ID hasil ujian
  const { questionIndex, grade } = req.body; // Index pertanyaan dan nilai yang diberikan

  try {
    // Temukan hasil ujian berdasarkan ID
    const result = await Result.findById(resultId);
    if (!result) {
      return res.status(404).json({ message: "Hasil ujian tidak ditemukan" });
    }

    // Pastikan soal yang dinilai adalah essay
    const answer = result.answers[questionIndex];
    if (answer.type !== "essay") {
      return res.status(400).json({ message: "Ini bukan soal essay" });
    }

    // Simpan nilai (grade) yang diberikan
    answer.marksObtained = grade;

    // Tandai hasil ini sebagai telah diperiksa
    result.isChecked = true;

    // Simpan perubahan ke database
    await result.save();

    res.status(200).json({ message: "Essay berhasil dinilai", result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menilai essay", error });
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
      // Temukan soal yang sesuai
      const question = examQuestions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );

      if (question && question.correctAnswer) {
        const correctAnswer = question.correctAnswer; // "B"
        const selectedAnswerText = answer.selectedAnswer; // Teks jawaban yang dipilih siswa, misal: "Komponen fisik dari komputer"

        // Cari posisi huruf (A, B, C, D) dari teks jawaban yang dipilih
        const selectedAnswerPosition =
          question.options.indexOf(selectedAnswerText);

        // Ubah posisi menjadi huruf A, B, C, atau D
        const selectedAnswer = ["A", "B", "C", "D"][selectedAnswerPosition];

        // Cocokkan huruf posisi dengan jawaban benar
        if (selectedAnswer === correctAnswer) {
          totalMarks += question.marks; // Tambahkan nilai jika jawaban benar
        } else {
          console.log(
            `Jawaban yang dipilih "${selectedAnswer}" tidak sesuai dengan jawaban benar "${correctAnswer}"`
          );
        }
      } else {
        console.log(
          "Soal atau correctAnswer tidak ditemukan untuk:",
          answer.questionId
        );
      }
    }
  });

  return totalMarks;
};

const calculateTotalMarks = async (examId, studentId) => {
  try {
    // Ambil data ujian dan hasil jawaban siswa
    const exam = await Exam.findById(examId);
    const result = await Result.findOne({ examId, studentId });

    if (!exam || !result) {
      throw new Error("Exam atau hasil ujian tidak ditemukan");
    }

    // Hitung nilai soal multiple-choice
    const multipleChoiceMarks = calculateMultipleChoiceMarks(
      result.answers,
      exam.questions
    );

    // Tambahkan nilai essay jika sudah diberikan examiner
    const essayMarks = result.answers
      .filter((answer) => answer.type === "essay" && answer.marksObtained)
      .reduce((acc, answer) => acc + answer.marksObtained, 0);

    // Total nilai yang diperoleh
    const totalMarks = multipleChoiceMarks + essayMarks;

    // Simpan total nilai ke dalam result
    result.totalMarksObtained = totalMarks;

    // Tandai hasil sebagai sudah diperiksa jika semua essay sudah diberi nilai
    const allEssaysGraded = result.answers.every(
      (answer) => answer.type !== "essay" || answer.marksObtained
    );
    if (allEssaysGraded) {
      result.isChecked = true; // Semua essay sudah dinilai
    }

    // Simpan perubahan ke database
    await result.save();

    return result;
  } catch (error) {
    throw new Error(`Error menghitung total nilai: ${error.message}`);
  }
};

const submitExamResult = async (req, res) => {
  const { resultId } = req.params;

  try {
    const result = await Result.findById(resultId);

    if (!result) {
      return res.status(404).json({ message: "Hasil ujian tidak ditemukan" });
    }

    const { examId, studentId, studentEmail } = result;

    const calculatedResult = await calculateTotalMarks(examId, studentId);

    // Kirim email setelah nilai dihitung
    sendEmail(
      studentEmail,
      "Nilai Ujian Anda",
      `Nilai ujian Anda adalah ${calculatedResult.totalMarks}.`
    );

    res.status(200).json({
      message: "Nilai ujian berhasil dihitung dan email terkirim",
      result: calculatedResult,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error menghitung total nilai: ${error.message}`,
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
