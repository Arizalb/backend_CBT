const mongoose = require("mongoose");

const questionSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["multiple_choice", "essay"],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: [String], // Hanya untuk multiple_choice
    correctAnswer: String, // Hanya untuk multiple_choice
    marks: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const examSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    duration: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    token: { type: String, required: true }, // Add token or password here
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
