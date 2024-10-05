const Joi = require("joi");

// Schema untuk validasi pengiriman jawaban ujian
const submitResultSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        type: Joi.string().valid("multiple_choice", "essay").required(),
        selectedAnswer: Joi.string().when("type", {
          is: "multiple_choice",
          then: Joi.string().required(),
        }),
        essayAnswer: Joi.string().when("type", {
          is: "essay",
          then: Joi.string().required(),
        }),
      })
    )
    .required(),
});

// Middleware untuk memvalidasi hasil ujian
const validateSubmitResult = (req, res, next) => {
  const { error } = submitResultSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateSubmitResult };
