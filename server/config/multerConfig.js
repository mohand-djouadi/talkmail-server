const multer = require('multer');
const path = require('path');

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       // cb(null, `server/controllers/uploads`); // Dossier où les pièces jointes seront stockées
//       // cb(null, path.join(__dirname, 'uploads'));
//       cb(null, path.join(__dirname, 'uploads'));
//       // cb(null, '/opt/render/project/src/server/config/uploads');
//     },
//     filename: function (req, file, cb) {
//       cb(null, `${Date.now()}_${file.originalname}`); // Nom du fichier
//     },
//   }),
// });

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'config', 'uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

module.exports = upload;



