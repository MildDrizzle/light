"use strict";

let express = require("express");
let app = express();
const db = require('./queries');
let Parser = require("./parser");
const bodyParser = require('body-parser');
let parser = new Parser(process.argv);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'Outer Documentation Server API' })
})

app.get('/users', db.getUsers);
app.get('/users/:id', db.getUserById);
app.post('/users', db.createUser);
app.put('/users/:id', db.updateUser);
app.delete('/users/:id', db.deleteUser);


module.exports = app;