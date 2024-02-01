const express = require('express');
const { retrieveMails } = require('../controllers/mailBoxController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// retrouver les mailbox ;-)
router.route('/retrievemails/:userId').get(protect, retrieveMails);

module.exports = router;
