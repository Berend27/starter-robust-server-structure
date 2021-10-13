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
    next({ status: 404, message: `Count id not found: ${countId}`});
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
    next({ status: 404, message: `Flip id not found: ${flipId}`});
  }
});

// modified to handle only get requests
app.get("/flips", (req, res) => {
  res.json({ data: flips });
});

// New middleware function to validate the request body
function bodyHasResultProperty(req, res, next) {
  const { data: { result } = {} } = req.body;
  if (result) {
    return next();
  }
  next({
    status: 400,
    message: "A 'result' property is required.",
  });
}



// added a post handler
// Variable to hold the next ID
// Because some IDs may already be used, find the largest assigned ID
let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

app.post(
  "/flips", 
  bodyHasResultProperty,  // added the validation middleware function
  (req, res) => {
    const { data: { result } = {} } = req.body;
    const newFlip = {
      id: ++lastFlipId, // Incremenet las ID, then assign as the current ID
      result,
    };
    flips.push(newFlip);
    counts[result] = counts[result] + 1; // Increment the counts
    res.status(201).json({ data: newFlip });  // chained a call to status() to set the status
});

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  const { status = 500, message = "Something went wrong!" } = error;
  res.status(status).json({ error: message });
});

module.exports = app;
