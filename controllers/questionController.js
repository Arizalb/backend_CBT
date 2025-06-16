const Question = require("../models/questionModel");

// Controller untuk mendapatkan daftar soal dengan pagination dan filtering
const getQuestions = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const keyword = req.query.keyword
    ? {
        questionText: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const count = await Question.countDocuments({ ...keyword });
  const questions = await Question.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    questions,
    page,
    totalPages: Math.ceil(count / pageSize),
    totalQuestions: count,
  });
};

module.exports = { getQuestions };
