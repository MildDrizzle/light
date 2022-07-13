"use strict";

const express = require('express');
const path = require('path');
let Parser = require("./parser");
let parser = new Parser(process.argv);
const PORT = parser.getPort();
const app = express();


app.use('/book',express.static("./static/book/html"));

app.listen(PORT);
console.log("server started on port " + PORT);
