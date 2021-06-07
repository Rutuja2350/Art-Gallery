//PUBLIC PAGE - SCHEMA
var mongoose = require("mongoose");

var gallerySchema = new mongoose.Schema({
    name: String,
    image: String
});

module.exports = mongoose.model("Gallery", gallerySchema);