const mongoose = require('mongoose');

const reportsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: false
    },
    date: {
        type: String,
        required: true
    },
    status: {           // is submitted: 0/ is being reviewed: 1/ is resolved: 2
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Reports', reportsSchema);
