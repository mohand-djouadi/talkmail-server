const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      'mongodb+srv://ISInnovate:TalkMail2324@isinnovate.9mvjqgg.mongodb.net/?retryWrites=true&w=majority',
    );
  } catch (error) {
    process.exit();
  }
};

module.exports = connectDB;
