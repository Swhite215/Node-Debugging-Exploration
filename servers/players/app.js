const express = require("express");
const requestLogger = require("../shared/lib/requestLogger");
const expressRequestID = require("express-request-id")();

const app = express();

app.set("x-powered-by", false);

app.use(express.json());
app.use(expressRequestID);
app.use(requestLogger);
app.use(require("./router"));

module.exports = app;
