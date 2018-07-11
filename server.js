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
  id: String,
});
const User = mongoose.model('User', newUserSchema);

const exercise = mongoose.Schema({
  id: String,
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
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
  let updatedLog;
  const query = { id: request.body.id };
  const tempDoc = User.findOne(query, (err, doc) => {
    if (err) return false;
    return doc;
  });
  if (tempDoc) {
    if (tempDoc.log) {
      updatedLog = tempDoc.log.push([
        {
          description: request.body.description,
          duration: request.body.duration,
          date: request.body.date
            ? moment(request.body.date, 'ddd MMM Do YYYY').toString()
            : moment()
              .format('ddd MMM Do YYYY')
              .toString(),
        },
      ]);
    } else {
      updatedLog = [
        {
          description: request.body.description,
          duration: request.body.duration,
          date: request.body.date
            ? moment(request.body.date, 'ddd MMM Do YYYY').toString()
            : moment()
              .format('ddd MMM Do YYYY')
              .toString(),
        },
      ];
    }
    Exercise.updateOne(query, { log: updatedLog }, (err) => {
      if (err) return console.error(err); //eslint-disable-line
      return true;
    });
    response.json({
      id: request.body.id,
      name: tempDoc.name,
      description: request.body.description,
      duration: request.body.duration,
      date: updatedLog[0].date,
    });
  } else {
    // If no such user
    response.send('User not found');
  }
});

app.get('/api/log', (request, response) => {
  const doc = Exercise.findOne({ id: request.query.id }, (err, document) => {
    if (err) return false;
    return document;
  });
  if (doc) {
    response.json({ Logs: doc.logs[0] });
  } else {
    response.send('No logs found!');
  }
});
app.listen(process.env.PORT || 3000);
