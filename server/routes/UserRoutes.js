const express = require('express');
const {
  registerUser,
  authUser,
  searchUsers,
  deleteUsers,
  forgotPassword,
  resetPassword,
  changePassword,
  changePic,
  sendOtp,
  toggleTwoFA,
  // verifyOTP,
} = require('../controllers/userControllers');
const userModel = require('../models/UserModel');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// router.get('/all', async (req, res) => {
//   res.send(await userModel.find());
// });

router.get('/me', async (req, res) => {
  const user = req.user;
  res.send(await userModel.findById(user._id));
});

router.route('/').post(registerUser);
router.get('/search', protect, searchUsers);
router.post('/signin', authUser);
router.delete('/delete/:id', protect, deleteUsers);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);
router.put('/changepassword', protect, changePassword);
router.put('/changepic', protect, changePic);
router.post('/sendotp', sendOtp);
router.put('/2FA', protect, toggleTwoFA);
// router.post('/verify', protect, verifyOTP);

module.exports = router;
