// server/src/controllers/shiurController.js
const Shiur = require('../models/Shiur');
const User = require('../models/User');

// Fetch all shiurim or specific ones by IDs
const getShiurim = async (req, res) => {
  try {
    const { ids } = req.query;
    let shiurim;

    if (ids) {
      const idArray = ids.split(',');
      shiurim = await Shiur.find({ _id: { $in: idArray } }).populate('rabbi');
    } else {
      shiurim = await Shiur.find().populate('rabbi').sort({ createdAt: -1 });
    }

    res.json(shiurim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new shiur
const createShiur = async (req, res) => {
  try {
    const { title, description, rabbi, url, duration, topic, level } = req.body;
    const newShiur = new Shiur({ title, description, rabbi, url, duration, topic, level });
    await newShiur.save();
    res.status(201).json(newShiur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing shiur
const updateShiur = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedShiur = await Shiur.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedShiur) {
      return res.status(404).json({ message: 'Shiur not found' });
    }
    
    res.json(updatedShiur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a shiur
const deleteShiur = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShiur = await Shiur.findByIdAndDelete(id);
    
    if (!deletedShiur) {
      return res.status(404).json({ message: 'Shiur not found' });
    }
    
    res.json({ message: 'Shiur deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single shiur by ID
const getShiurById = async (req, res) => {
  try {
    const { id } = req.params;
    const shiur = await Shiur.findById(id).populate('rabbi');
    if (!shiur) {
      return res.status(404).json({ message: 'Shiur not found' });
    }
    res.json(shiur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export the controller functions
module.exports = {
  getShiurim,
  getShiurById,
  createShiur,
  updateShiur,
  deleteShiur,
};