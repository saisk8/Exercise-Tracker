const mongoose = require('mongoose');

const exercise = mongoose.Schema(
  {
    userId: String,
    description: String,
    duration: Number,
    date: Date,
  },
  { _id: false },
);

const Exercise = mongoose.model('Exercise', exercise);

module.exports = Exercise;
