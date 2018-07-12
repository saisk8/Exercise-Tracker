// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const moment = require('moment');

const app = express();
mongoose.connect('mongodb://localhost:27017/test');

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
  const newUser = new User({ name: request.body.username, id });
  newUser.save((err) => {
    if (err) return console.error(err); // eslint-disable-line
    return console.log('Saved'); // eslint-disable-line
  });
  response.json(newUser);
});

app.post('/api/add', (request, response) => {
  // Find if the user exists in the database
});

app.get('/api/log', (request, response) => {
  Exercise.findOne({ id: request.query.id }).exec((err, doc) => {
    if (!doc) return response.send('No logs found!');
    return response.json(doc);
  });
});
app.listen(process.env.PORT || 3000);

// Notes
request.body.date
  ? moment(request.body.date, 'ddd MMM Do YYYY').toString()
  : moment()
    .format('ddd MMM Do YYYY')
    .toString();
