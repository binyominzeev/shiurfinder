// filepath: /server/src/models/Shiur.js
const mongoose = require('mongoose');

const shiurSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  rabbi: { type: mongoose.Schema.Types.ObjectId, ref: 'Rabbi', required: true },
  url: { type: String, required: true },
  duration: String,
  topic: String,
  parasha: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Shiur = mongoose.model('Shiur', shiurSchema);

module.exports = Shiur;