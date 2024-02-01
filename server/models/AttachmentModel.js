const mongoose = require('mongoose');

// schema et modele pour la collection pieceJointe
const attachmentSchema = new mongoose.Schema({
  nameAttach: String,
  url: String,
  taille: {
    type: Number,
    default: 1073741824,
  },
});
const AttachmentModel = mongoose.model('AttachmentModel', attachmentSchema);
module.exports = AttachmentModel;
