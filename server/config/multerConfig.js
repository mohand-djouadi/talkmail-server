const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `/opt/render/project/src/server/config/uploads`); // Dossier où les pièces jointes seront stockées
      // cb(null, path.join(__dirname, 'uploads'));
    },

    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`); // Nom du fichier
    },
  }),
});

module.exports = upload;
