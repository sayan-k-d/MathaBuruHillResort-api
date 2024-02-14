const mongoose = require("mongoose");
const Joi = require("joi");
const UserSchema = new mongoose.Schema(
  {
    dateOfBirth: {
      type: Date,
      default: "",
    },
    gender: {
      type: String,
      default: "",
      emum: ["MALE", "FEMALE"],
    },
    address: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
      minlength: 3,
      maxlength: 60,
      required: true,
    },
    password: {
      type: String,
      default: "",
      minlength: 6,
      maxlength: 1024,
      required: true,
    },
    email: {
      type: String,
      default: "",
      minlength: 6,
      maxlength: 255,
      unique: true,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
      default: 0,
      minlength: 10,
      maxlength: 15,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      default: "ADMIN",
      enum: ["ADMIN", "SUPER_ADMIN"],
    },
    verificationToken: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
      default: "",
    },
    resetTokenExpire: {
      type: Date,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

function validateInput(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(60).required(),
    mobile: Joi.number().required(),
    email: Joi.string().min(6).max(255).email().required(),
    password: Joi.string().min(6).max(255).required(),
    gender: Joi.string().valid("MALE", "FEMALE"),
    address: Joi.string().max(1024),
  });
  return schema.validate(user);
}

module.exports.Users = mongoose.model("User", UserSchema, "User");
module.exports.validate = validateInput;
