//NEWS - SCHEMA
var mongoose = require("mongoose");

var NewsSchema = new mongoose.Schema({
    by: String,
    text: String
});

module.exports = mongoose.model("News", NewsSchema);