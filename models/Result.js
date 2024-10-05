const mongoose = require("mongoose");

const answerSchema = mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ["multiple_choice", "essay"],
      required: true,
    },
    selectedAnswer: {
      // Untuk multiple_choice
      type: String,
      required: function () {
        // Jika type adalah multiple_choice, maka selectedAnswer harus ada
        return this.type === "multiple_choice";
      },
    },
    essayAnswer: {
      // Untuk essay
      type: String,
      required: function () {
        // Jika type adalah essay, maka essayAnswer harus ada
        return this.type === "essay";
      },
    },
    marksObtained: Number, // Nilai yang diperoleh untuk soal ini
  },
  { _id: false }
);

const resultSchema = mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [answerSchema],
    totalMarksObtained: Number,
    isChecked: {
      type: Boolean,
      default: false, // Menandakan apakah hasil sudah diperiksa (untuk soal essay)
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pastikan kombinasi examId dan studentId unik
resultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
