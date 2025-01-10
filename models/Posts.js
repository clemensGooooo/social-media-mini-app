const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  date: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    required: true
  },
  referredTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
    default: null
  },
  mediaContent: [
    {
      type: String,
      required: false
    }
  ],
  isOnline: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('Posts', postSchema);
