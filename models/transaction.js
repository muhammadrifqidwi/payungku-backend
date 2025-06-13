const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    returnLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    orderId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "active", "returned", "late"],
      default: "active",
    },
    snapToken: {
      type: String,
    },
    totalPayment: { type: Number, required: true },
    lockerCode: { type: String },
    rentCode: { type: String, required: true, unique: true },
    rentDuration: { type: Number, required: true, default: 60 },
    returnLockerCode: { type: String },
    returnTime: { type: Date },
    token: { type: String, default: null },
    tokenExpiresAt: { type: Date },
    penaltyAmount: { type: Number, default: 0 },
    penaltyStatus: {
      type: String,
      enum: ["pending", "paid", "none"],
      default: "none",
    },
    penaltyOrderId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
