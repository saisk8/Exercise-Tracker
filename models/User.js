const mongoose = require('mongoose');

const newUserSchema = mongoose.Schema(
  {
    name: String,
    userId: String,
  },
  { _id: false },
);
const User = mongoose.model('User', newUserSchema);

module.exports = User;
