const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createEvent,
  getAllEvents,
  deleteEvent,
  updateEvent,
} = require('../controllers/eventsController');

const router = express.Router();

router.route('/events').post(protect, createEvent);

router.route('/events').get(protect, getAllEvents);

router.route('/events/:id').put(protect, updateEvent);

router.route('/events/:id').delete(protect, deleteEvent);

module.exports = router;
