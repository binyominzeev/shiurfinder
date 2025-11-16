const mongoose = require('mongoose');

const rabbiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
  followers: { type: Number, default: 0 }
});

const Rabbi = mongoose.model('Rabbi', rabbiSchema);

module.exports = Rabbi;