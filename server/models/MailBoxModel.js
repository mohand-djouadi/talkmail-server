const mongoose = require('mongoose');

// schema et modele pour la collection mailBox
const mailBoxSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
  },
  mails: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MailModel',
    },
  ],
  // starredEmails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MailModel' }],
});
const MailBoxModel = mongoose.model('MailBoxModel', mailBoxSchema);
module.exports = MailBoxModel;
