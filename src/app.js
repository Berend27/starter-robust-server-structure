const express = require("express");
const app = express();
const counts = require("./data/counts-data");
const countsRouter = require("./counts/counts.router");
const flipsRouter = require("./flips/flips.router");

// todo: Router section about using the controller, about a quarter of the way into the lesson

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

app.use("/counts", countsRouter);

app.use("/flips", flipsRouter); // Note: app.use

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
