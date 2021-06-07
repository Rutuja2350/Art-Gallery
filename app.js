var express = require("express");
var app = express();
var request = require("request");
var expressSanitizer = require("express-sanitizer");
var mongoose = require("mongoose");
var fetch = require("node-fetch");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var User = require("./views/user");
var Blog = require("./views/post");
var Gallery = require("./views/gallery");
var passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config();
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
    cloud_name: 'rutuja', 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

app.set("view engine", "ejs");

//backup for DBURL (not mandatory)
var url = process.env.DBURL || "mongodb://localhost/gallery" ;
//connecting to MongoAtlas
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

// var gallerySchema = new mongoose.Schema({
//     name: String,
//     image: String
// });
// var Gallery = mongoose.model("gallery", gallerySchema);
// gallery.create(
//     {   
//         image:"https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         name:"rutujs"
//     }
// );

// var gallery = [
//     {   image:"https://images.unsplash.com/photo-1523554888454-84137e72c3ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//         name:"rutuja"
//     },
//     {   image:"https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//         name:"priya"
//     },
//     {   image:"https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         name:"snehal"
//     }
// ];

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());  
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


//basic route
app.get("/", function(req, res){
    res.render("landing");
});

//gallery
app.get("/gallery", function(req, res){
    res.render("gallery",{currentUser: req.user});
});

//show login form
app.get("/gallery/login", function(req, res){
    res.render("login");
});

//handle login logic
app.post("/gallery/login", passport.authenticate("local", {
    successRedirect: "/gallery",
    failureRedirect: "/gallery/login"
    }) ,function(req, res){

});

//show sign-up form
app.get("/gallery/register", function(req, res){
    res.render("register");
});

//handle sign up logic
app.post("/gallery/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/gallery");
            });
        }
    });
});

//logout
app.get("/gallery/logout", function(req, res){
    req.logout();
    res.redirect("/gallery");
});

//*********

//PUBLIC PAGE - GET
app.get("/gallery/public_page", function(req, res){
    Gallery.find({}, function(err, gallery){
        if(err){
            console.log(err);
        }
        else{
            res.render("gallery/public_page", {gallery: gallery});
        }
    });
});

//PUBLIC NEW POST - POST
app.post("/gallery/public_page", upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        var image = result.secure_url;
        // req.body.gallery.image = result.secure_url;
        console.log("image : "+image);
        // req.body.gallery.name = req.body.name;
        var name = req.body.name;
        var newBlog = {name: name, image: image};
        Gallery.create(newBlog, function(err, gallery) {
            if (err) {
                console.log("err gallery = " + gallery);
            }
            else{
                console.log("gallery = "+gallery);
                res.redirect("/gallery/public_page");
            }
        });
    });
});

//PUBLIC PAGE - show the form that will send the data to the above post route
app.get("/gallery/public_page/new", isLoggedIn, function(req, res){
    res.render("new");
});
// *****

app.get("/gallery/type", function(req, res){
    res.render("gallery/type");
});

app.get("/gallery/trend", function(req, res){
    res.render("gallery/trend");
});

app.get("/gallery/type/one", function(req, res){
    res.render("gallery/type/one");
});

app.get("/gallery/type/two", function(req, res){
    res.render("gallery/type/two");
});

app.get("/gallery/type/three", function(req, res){
    res.render("gallery/type/three");
});

app.get("/gallery/type/four", function(req, res){
    res.render("gallery/type/four");
});

app.get("/gallery/type/five", function(req, res){
    res.render("gallery/type/five");
});

app.get("/gallery/type/six", function(req, res){
    res.render("gallery/type/six");
});

//blogs-GET route
app.get("/gallery/blog", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if(err){
            res.redirect("/gallery/login");
        }
        else{
            res.render("gallery/nav_item/blog",{blogs: allBlogs});
        }
    });
});

//new blog-CREATE
app.get("/gallery/blog/new_blog", isLoggedIn, function(req, res){
    res.render("gallery/nav_item/new_blog");
});

//blog-POST route
app.post("/gallery/blog", function(req, res){
    var name = req.body.name;
    var title = req.body.title;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newBlog = {name: name, image: image, description: desc, title: title, author: author};
    Blog.create(newBlog, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/gallery/blog"); 
        }
    });
});

//blog - DESTROY route
app.delete("/gallery/blog/:id" , isLoggedIn, checkBlogOwnership, function(req, res){
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
            res.redirect("/gallery/blog");
        } 
        else {
            blog.remove();
            res.redirect("/gallery/blog");
        }
    });
});

//artists
app.get("/gallery/artists/pablo", function(req, res){
    res.render("gallery/nav_item/artists/pablo");
});

app.get("/gallery/artists/husain", function(req, res){
    res.render("gallery/nav_item/artists/husain");
});

app.get("/gallery/artists/norman", function(req, res){
    res.render("gallery/nav_item/artists/norman");
});

app.get("/gallery/artists/amrita", function(req, res){
    res.render("gallery/nav_item/artists/amrita");
});

// *****  //

app.get("/gallery/history", function(req, res){
    res.render("gallery/nav_item/history");
});


//news
app.get("/gallery/news", function(req, resp){
    request("https://hacker-news.firebaseio.com/v0/item/8863.json?print=pretty/", function(error, response, body){
        if(!error && response.statusCode == 200){
            var object = JSON.parse(body);
            var array = [];
            array = object.kids;
            var news = [];
                for(var i=0; i<10; i++){ 
                    request("https://hacker-news.firebaseio.com/v0/item/"+array[i]+".json?print=pretty", function(err, res, body2){ 
                        if(!err && res.statusCode == 200){
                            var sanitizerConfig = {
                                p: {},
                                a: {} 
                            };
                            var ar = JSON.parse(body2);
                            var by = ar.by;
                            var text = ar.text;
                            // ## sanitize text remainind DOUBT ##
                            var newNews = {by: by, text: text};
                            news.push(newNews);
                        }                    
                    });
                };
            setTimeout(() => {
                resp.render("gallery/news",{ar: news});
            }, 3000);
        }
    }); 
});


//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/gallery/login");
    }
};

function checkBlogOwnership(req, res, next){
    if(req.isAuthenticated()){        
        Blog.findById(req.params.id, function(err, foundBlogs){
            if(err){
                console.log(err);
            }
            else{
                if(foundBlogs.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("back");
                }                    
            }
        });
    }
    else{
        res.redirect("back");
    }
};


var port = process.env.PORT || 5005;
app.listen(port, function(){
    console.log("The Gallery server started...");
});