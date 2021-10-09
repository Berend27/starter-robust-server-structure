const express = require("express");
const app = express();
const counts = require("./data/counts-data");
const flips = require("./data/flips-data");

app.use("/counts/:countId", (req, res, next) => {
  const { countId } = req.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next(`Count id not found: ${countId}`);
  } else {
    res.json({ data: foundCount }); // Return a JSON object, not a number
  }
});

app.use("/counts", (req, res) => {
  res.json({ data: counts });
});

// use the flip state to return one flip record by id, or an error if the id doesn't exist
app.use("/flips/:flipId", (req, res, next) => {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));

  if (foundFlip) {
    res.json({ data: foundFlip });
  } else {
    next(`Flip id not found: ${flipId}`);
  }
});

app.use("/flips", (req, res) => {
  res.json({ data: flips });
});

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  response.send(error);
});

module.exports = app;
