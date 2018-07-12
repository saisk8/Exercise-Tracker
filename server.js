// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const User = require('./models/User');
const Exercise = require('./models/Exercise');

const app = express();
mongoose.connect('mongodb://localhost:27017/new');

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
  const userId = shortid.generate();
  const newUser = new User({ name: request.body.name, userId });
  newUser.save((err) => {
    if (err) return console.error(err); // eslint-disable-line
    return console.log('Saved'); // eslint-disable-line
  });
  response.json(newUser);
});

app.post('/api/add', (request, response) => {
  // Find if the user exists in the database
  User.findOne({ userId: request.body.id }, (err, user) => {
    if (err) return response.send('Cannot do database lookup. Please try again later');
    if (!user) return response.send('No such user!');
    const newExercise = request.body.date
      ? new Exercise({
        userId: request.body.id,
        description: request.body.description,
        duration: request.body.duration,
        date: new Date(Date.parse(request.body.date)),
      })
      : new Exercise({
        userId: request.body.id,
        description: request.body.description,
        duration: request.body.duration,
        date: new Date(),
      });
    newExercise.save((error) => {
      if (error) return response.send('Could not save the log, please try again');
      return true;
    });
    return response.json(newExercise);
  });
});

app.get('/api/log', (request, response) => {
  const query = { userId: request.query.id };
  if (request.query.from) query.date = { $gte: request.query.from };
  if (request.query.to) query.date = { $lte: request.query.to };
  if (request.query.from && request.query.to) {
    query.date = {
      $gte: request.query.from,
      $lte: request.query.to,
    };
  }
  if (request.query.limit) {
    Exercise.find(query).exec((err, log) => {
      if (err) return response.send('Error while searching, try again');
      if (!log) return response.send('No logs found');
      return response.json({ Logs: log.slice(request.query.limit) });
    });
  } else {
    Exercise.find(query).exec((err, log) => {
      if (err) return response.send('Error while searching, try again');
      if (!log) return response.send('No logs found');
      return response.json(log);
    });
  }
});
app.listen(process.env.PORT || 3000);
