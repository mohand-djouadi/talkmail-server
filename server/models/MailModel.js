const mongoose = require('mongoose');

// schema et modele pour la collection Mail
const mailSchema = new mongoose.Schema({
  from: {
    //le soucis qui se pose on Cast ObjectID (645473783) en string (sia@gmail.com)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],

  subject: {
    type: String,
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attachments: [
    {
      filename: String,
      path: String,
    },
  ],

  starred: {
    type: Boolean,
    default: false,
  },
  bin: {
    type: Boolean,
    default: false,
  },
  important: {
    type: Boolean,
    default: false,
  },
  draft: {
    type: Boolean,
    default: false,
  },
});
// modele pour la collection Mail
const MailModel = mongoose.model('MailModel', mailSchema);
module.exports = MailModel;
