// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');

const app = express();
mongoose.connect('mongodb://localhost/test' || process.env.MONGO_URI);

// Schemas
const newUserSchema = mongoose.Schema({
  name: String,
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
  db.on('open', () => {
    const NewUser = mongoose.model('NewUser', newUserSchema);
    const id = shortid.generate();
    const newUser = new NewUser({ name: request.body.name, id });
    newUser.save((err) => {
      if (err) return console.error(err); // eslint-disable-line
      return true;
    });
    response.json(newUser);
  });
});

app.listen(process.env.PORT || 3000);
