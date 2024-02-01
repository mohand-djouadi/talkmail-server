const mongoose = require('mongoose');

const voiceMessageModel = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  size: Number,
  duration: Number,
  url: String,
});

const VoiceMessage = mongoose.model('VoiceMessage', voiceMessageModel);

module.exports = VoiceMessage;
