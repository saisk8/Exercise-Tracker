// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');

const app = express();
mongoose.connect('mongodb://localhost:27017/test');

// Schemas
const newUserSchema = mongoose.Schema({
  name: String,
  id: String,
});

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
  const NewUser = mongoose.model('NewUser', newUserSchema);
  const id = shortid.generate();
  const newUser = new NewUser({ name: request.body.username, id });
  newUser.save((err) => {
    if (err) return console.error(err); // eslint-disable-line
    return console.log('Saved'); // eslint-disable-line
  });
  response.json(newUser);
});

app.post('/api/add', (request, response) => {});
app.listen(process.env.PORT || 3000);
