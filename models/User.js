const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  requested_followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  }
});

module.exports = mongoose.model('User', userSchema);

