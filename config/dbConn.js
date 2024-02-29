const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
  } catch (err) {
    console.log({ mongodb_connection_error: err });
  }
};

module.exports = connectDb;
