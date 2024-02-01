const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  sendMessage,
  allMessages,
} = require('../controllers/messageControllers');

const router = express.Router();

// la route pour envoyer un message
router.route('/').post(protect, sendMessage);

// la route pour recuperer un message dans une discussion
router.route('/:chatId').get(protect, allMessages);

module.exports = router;
