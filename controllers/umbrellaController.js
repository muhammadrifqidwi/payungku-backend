const Umbrella = require("../models/umbrella");

exports.getAll = async (req, res) => {
  const items = await Umbrella.find().populate("location");
  res.json(items);
};

exports.create = async (req, res) => {
  const item = await Umbrella.create(req.body);
  res.status(201).json(item);
};

exports.updateStatus = async (req, res) => {
  const u = await Umbrella.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      lastRentedAt: req.body.status === "rented" ? new Date() : null,
    },
    { new: true }
  );
  res.json(u);
};
