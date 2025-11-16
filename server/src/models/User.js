const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shiur' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shiur' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rabbi' }],
  shiurNotes: [{
    shiurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shiur' },
    note: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;