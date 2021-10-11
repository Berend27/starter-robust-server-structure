const express = require("express");
const app = express();
const counts = require("./data/counts-data");
const flips = require("./data/flips-data");

// simple yet important step
// adding middleware to parsse incoming requests that contain JSON payloads
app.use(express.json());

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

// 2. modified to handle only get requests
app.get("/flips", (req, res) => {
  res.json({ data: flips });
});

// 3. added a post handler
// Variable to hold the next ID
// Because some IDs may already be used, find the largest assigned ID
let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

app.post("/flips", (req, res, next) => {
  const { data: { result } = {} } = req.body;
  if (result) {
    const newFlip = {
      id: ++lastFlipId, // Incremenet las ID, then assign as the current ID
      result,
    };
    flips.push(newFlip);
    counts[result] = counts[result] + 1; // Increment the counts
    res.status(201).json({ data: newFlip });  // chained a call to status() to set the status
  } else {
    res.sendStatus(400);  // sends an error status code of 400
  }
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
