const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, default: '(No Subject)' },
    text: { type: String },
    html: { type: String },
    isRead: { type: Boolean, default: false },
    folder: { type: String, enum: ['inbox', 'sent', 'trash'], default: 'inbox' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Email', EmailSchema);
