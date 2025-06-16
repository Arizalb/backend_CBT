const Joi = require("joi");

// Schema untuk validasi pengiriman jawaban ujian
const submitResultSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        type: Joi.string().valid("multiple_choice", "essay").required(),
        selectedAnswer: Joi.string()
          .allow(null, "")
          .when("type", {
            is: "multiple_choice",
            then: Joi.string().required().messages({
              "string.empty": "Jawaban pilihan ganda tidak boleh kosong.",
              "any.required": "Jawaban pilihan ganda wajib diisi.",
            }),
          }),
        essayAnswer: Joi.string()
          .allow(null, "")
          .when("type", {
            is: "essay",
            then: Joi.string().required().messages({
              "string.empty": "Jawaban esai tidak boleh kosong.",
              "any.required": "Jawaban esai wajib diisi.",
            }),
          }),
      })
    )
    .required(),
});

// Middleware untuk memvalidasi hasil ujian
const validateSubmitResult = (req, res, next) => {
  const { error } = submitResultSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: error.details.map((err) => err.message).join(", ") });
  }
  next();
};

module.exports = { validateSubmitResult };
