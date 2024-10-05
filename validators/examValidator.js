const Joi = require("joi");

// Schema untuk membuat ujian baru
const createExamSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(""), // Optional
  duration: Joi.number().min(1).required(),
  totalMarks: Joi.number().min(1).required(),
  questions: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid("multiple_choice", "essay").required(),
        questionText: Joi.string().min(5).required(),
        options: Joi.array()
          .items(Joi.string().min(1))
          .when("type", {
            is: "multiple_choice",
            then: Joi.array().min(2).required(),
            otherwise: Joi.array().max(0),
          }),
        correctAnswer: Joi.string().when("type", {
          is: "multiple_choice",
          then: Joi.string().required(),
        }),
        marks: Joi.number().min(1).required(),
      })
    )
    .min(1) // Minimal ada 1 pertanyaan
    .required(),
  token: Joi.string().required(),
});

// Schema untuk memperbarui ujian
const updateExamSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().allow("").optional(),
  duration: Joi.number().min(1).optional(),
  totalMarks: Joi.number().min(1).optional(),
  questions: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid("multiple_choice", "essay").required(),
        questionText: Joi.string().min(5).required(),
        options: Joi.array()
          .items(Joi.string().min(1))
          .when("type", {
            is: "multiple_choice",
            then: Joi.array().min(2).required(),
            otherwise: Joi.array().max(0),
          }),
        correctAnswer: Joi.string().when("type", {
          is: "multiple_choice",
          then: Joi.string().required(),
        }),
        marks: Joi.number().min(1).required(),
      })
    )
    .optional(), // Pertanyaan opsional pada update
  token: Joi.string().optional(),
});

// Middleware untuk memvalidasi data ujian berdasarkan schema pembuatan
const validateCreateExam = (req, res, next) => {
  const { error } = createExamSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Middleware untuk memvalidasi data ujian berdasarkan schema pembaruan
const validateUpdateExam = (req, res, next) => {
  const { error } = updateExamSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = {
  createExamSchema,
  updateExamSchema,
  validateCreateExam,
  validateUpdateExam,
};
