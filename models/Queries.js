const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
    },
    query: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports.Queries = mongoose.model(
  "userQueries",
  querySchema,
  "userQueries"
);
