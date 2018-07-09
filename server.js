// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
mongoose.connect(process.env.MONGO_URI);
// Middleware
app.use(express.static(`${__dirname}public`));
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.post('/api/new-user', (request, response) => {});

app.listen(process.env.PORT || 3000);
