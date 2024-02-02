const express = require('express');
const {
  forwardEmail,
  sendEmail,
  receiveEmail,
  moveToBin,
  deleteMail,
  toggleStarredEmail,
  replyToEmail,
  importantMails,
  download,
} = require('../controllers/mailController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/multerConfig');

const router = express.Router();

// Env mail
router
  .route('/sendemail')
  .post(protect, upload.array('attachments'), sendEmail);

// rep mail
router.route('/reply').post(protect, replyToEmail);

// Rec mail
router.route('/receiveemail/:to').get(protect, receiveEmail);

// ajout et retrait des favoris
router.route('/togglestar').put(protect, toggleStarredEmail);
router.route('/togglestar').put(protect, toggleStarredEmail);

router.route('/important').put(protect, importantMails);
router.route('/important').put(protect, importantMails);

// deplace vers corbelle
router.route('/movetobin').put(protect, moveToBin);
router.route('/movetobin').put(protect, moveToBin);

// Delete mail
router.route('/deletemail').delete(protect, deleteMail);
router.route('/deletemail').delete(protect, deleteMail);

// Forward mail
router.route('/forwardemail').post(protect, forwardEmail);
router.route('/downloadFile/:filename').get(protect, download);

module.exports = router;
