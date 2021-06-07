//BLOG POST - SCHEMA
var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    name: String,
    title: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Blog", blogSchema);