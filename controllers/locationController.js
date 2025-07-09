const Location = require("../models/location");

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name, latitude, longitude, lockers, stock } = req.body;
    const newLocation = new Location({
      name,
      latitude,
      longitude,
      lockers,
      stock,
    });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, stock, lockers } = req.body;
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name, latitude, longitude, stock, lockers },
      { new: true }
    );
    res.status(200).json(updatedLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    }
    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
