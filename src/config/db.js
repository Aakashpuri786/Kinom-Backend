const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDb = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
};

module.exports = connectDb;
