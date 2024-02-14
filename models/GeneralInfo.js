const mongoose = require("mongoose");

const generalInfoSchema = new mongoose.Schema(
  {
    nav: {
      type: Array,
      default: {},
    },
    banner: {
      type: Object,
      default: {},
    },
    aboutUs: {
      type: Object,
      default: {},
    },
    amenities: {
      type: Object,
      default: {},
    },
    quote: {
      type: Object,
      default: {},
    },
    gallery: {
      type: Object,
      default: {},
    },
    packages: {
      type: Object,
      default: {},
    },
    location: {
      type: Object,
      default: {},
    },
    contactUs: {
      type: Object,
      default: {},
    },
    contacts: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports.GeneralInfo = mongoose.model(
  "GeneralInfo",
  generalInfoSchema,
  "GeneralInfo"
);
