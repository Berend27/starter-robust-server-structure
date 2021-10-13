const counts = require("../data/counts-data");

function list(req, res) {
    res.json({ data: counts });
}

module.exports = {
    list,
}