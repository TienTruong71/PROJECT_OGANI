const mongoose = require('mongoose');

module.exports.connect = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/BHX_db_dev');
    console.log("Connected Successful!")
  } catch (error) {
    console.log("Connected Failure")
  }
}

