const counts = require("../data/counts-data");
const flips = require("../data/flips-data");

let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

function bodyHasResultProperty(req, res, next) {
    const { data: { result } = {} } = req.body;
    if (result) {
        return next();
    }
    next({
        status: 400,
        message: "A 'result' porperty is required.",
    });
}

function create(req, res) {
    const { data: { result } = {} } = req.body;
    const newFlip = {
        id: ++lastFlipId, // Increment last id then assign as the current ID
        result,
    };
    flips.push(newFlip);
    counts[result] = counts[result] + 1;
    res.status(201).json({ data: newFlip });
}

function destroy(req, res) {
    const { flipId } = req.params;
    const index = flips.findIndex((flip) => flip.id === Number(flipId));
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedFlips = flips.splice(index, 1);
    deletedFlips.forEach(
        (deletedFlip) => (counts[deletedFlip.result] = counts[deletedFlip.result] - 1)
    );

    res.sendStatus(204);
}

function flipExists(req, res, next) {
    const { flipId } = req.params;
    const foundFlip = flips.find((flip) => flip.id === Number(flipId));
    if (foundFlip) {
        return next();
    }
    next({
        status: 404,
        message: `Flip id not found: ${flipId}`,
    });
}

function list(req, res) {
    res.json({ data: flips });
}

function read(req, res) {
    const { flipId } = req.params;
    const foundFlip = flips.find((flip) => flip.id === Number(flipId));
    res.json({ data: foundFlip });
}

function resultPropertyIsValid(req, res, next) {
    const { data: { result } = {} } = req.body;
    const validResult = ["heads", "tails", "edge"];
    if (validResult.includes(result)) {
        return next();
    }
    next({
        status: 400,
        message: `Value of the 'result' property must be one of ${validResult}. Received: ${result}`,
    });
}

function update(req, res) {
    const { flipId } = req.params;
    const foundFlip = flips.find((flip) => flip.id === Number(flipId));

    const originalResult = foundFlip.result;
    const { data: { result } = {} } = req.body;

    if (originalResult !== result) {
        // update the flip
        foundFlip.result = result;
        // Adjust the counts
        counts[originalResult] = counts[originalResult] - 1;
        counts[result] = counts[result] + 1;
    }

    res.json({ data: foundFlip });
}

module.exports = {
    create: [bodyHasResultProperty, resultPropertyIsValid, create],
    list,
    read: [flipExists, read],
    update: [flipExists, bodyHasResultProperty, resultPropertyIsValid, update],
    delete: [flipExists, destroy],
};