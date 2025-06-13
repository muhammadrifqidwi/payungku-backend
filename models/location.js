const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  stock: { type: Number, required: true },
  lockers: { type: Number, required: true },
});

module.exports = mongoose.model("Location", locationSchema);
