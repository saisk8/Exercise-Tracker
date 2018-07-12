// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const moment = require('moment');

const app = express();
mongoose.connect('mongodb://localhost:27017/tracker');

// Schemas
const newUserSchema = mongoose.Schema({
  name: String,
  id: { type: String, unique: true },
});
const User = mongoose.model('User', newUserSchema);

const exercise = mongoose.Schema({
  id: { type: String, unique: true },
  description: String,
  duration: Number,
  date: { type: Date, default: moment().format('ddd MMM Do YYYY') },
});

const Exercise = mongoose.model('Exercise', exercise);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); // eslint-disable-line

// Middleware
app.use(express.static(`${__dirname}public`));
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.post('/api/new-user', (request, response) => {
  console.log('Connection openned'); //eslint-disable-line
  const id = shortid.generate();
  const newUser = new User({ name: request.body.name, id });
  newUser.save((err) => {
    if (err) return console.error(err); // eslint-disable-line
    return console.log('Saved'); // eslint-disable-line
  });
  response.json(newUser);
});

app.post('/api/add', (request, response) => {
  // Find if the user exists in the database
  User.findOne({ id: request.body.id }, (err, user) => {
    if (err) return response.send('Cannot do database lookup. Please try again later');
    if (!user) return response.send('No such user!');
    const newExercise = request.body.date
      ? new Exercise({
        id: request.body.id,
        description: request.body.description,
        duration: request.body.duration,
        date: moment(request.body.date, 'ddd MMM Do YYYY'),
      })
      : new Exercise({
        id: request.body.id,
        description: request.body.description,
        duration: request.body.duration,
      });
    newExercise.save((error) => {
      if (error) return response.send('Could not save the exercise, try again.');
      return true;
    });
    return response.json(exercise);
  });
});

app.get('/api/log', (request, response) => {
  const query = { id: request.query.id };
  if (request.query.from) query.date = { $gte: request.query.from };
  if (request.query.to) query.date = { $lte: request.query.to };
  if (request.query.from && request.query.to) {
    query.date = {
      $and: [{ $gte: request.query.from }, { $lte: request.query.to }],
    };
  }
  if (request.query.limit) query.limit = request.query.limit;
  Exercise.find(query)
    .limit(query.limit)
    .exec((err, log) => {
      if (err) return response.send('Error while searching, try again.');
      if (!log) return response.send('No logs found');
      return response.json(log);
    });
});
app.listen(process.env.PORT || 3000);
