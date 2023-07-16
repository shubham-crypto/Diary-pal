require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><body><p id="main">My First JSDOM!</p></body>`);
//const md5= require("md5")
//const bcrypt=require("bcrypt");
//const saltRounds=10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
//const encryption=require("mongoose-encryption")
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const findOrCreate = require('mongoose-findorcreate');

// const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "We vow to be you best buddy to help you combat lonliness and stress. since earlier times e have done every possible attempt to keep everything secret. we take care of you and help you to be in high spirits every day.";
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: 'Our little secret',
  resave: false,
  saveUninitialized: false,
}))

var ash=["google"];

app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1/medicDB');
  console.log("Connected");

  const postSchema = new mongoose.Schema({
    title: String,
    content: String
  })
  const Post = mongoose.model("Post", postSchema);

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret : String,
    review: postSchema
  })
  //userSchema.plugin(encryption,{secret : process.env.SECRETS , encryptedFields : ["password"]});
 
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);

  const User = new mongoose.model("User", userSchema)

  passport.use(User.createStrategy());

  // use static serialize and deserialize of model for passport session support
  passport.serializeUser(function(user, done) {
    done(null, user._id);
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id).then(function(user){
     done(null, user);
  }).catch(function (err) {
    done(err, null);
});
});

  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    useProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback: true
  },
    function (request, accessToken, refreshToken, profile, done) {
      console.log(profile)
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  ));


  app.get("/", function (req, res) {
    res.render("home")

  })

  app.get('/auth/google', passport.authenticate('google', {scope:['profile']}))
  
  app.get( '/auth/google/secrets',
    passport.authenticate( 'google', {
        successRedirect: '/account',
        failureRedirect: '/login'
  }));

  app.get("/about", function (req, res) {
    res.render("about", { startingc: aboutContent })
  })

  app.get("/compose", function (req, res) {
    if (req.isAuthenticated()){
      res.render("compose");
    } else {
      res.redirect("/login");
    }
  })

  app.get("/login", function (req, res) {
    res.render("login")
  })

  app.get("/Signup", function (req, res) {
    res.render("Signup")
  })

  app.get("/account", function (req, res) {
    User.find({"secret": {$ne: null}}).then(function(foundUsers){
        if (foundUsers) {
          res.render("account", {usersWithSecrets: foundUsers});
        }
    }).catch(function(err){
      console.log(err);
    })
  })

  app.get("/submit", function(req, res){
    if (req.isAuthenticated()){
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  });
  
  app.post("/submit", function(req, res){
    const submittedSecret = req.body.secret;
  
  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
    // console.log(req.user.id);
  
    User.findById(req.user.id).then(function(foundUser){
        if (foundUser) {
          foundUser.secret =submittedSecret;
          foundUser.save().then(function(){
            res.redirect("/account");
          });
        }
      }).catch(function(err){
        console.log(err);
      })
  });

  app.post("/logOut", function (req, res) {
    req.logout(function (result) {

    });
    res.redirect("/")
  })

  app.post("/Signup", function (req, res) {
    /*bcrypt.hash(req.body.password , saltRounds , function(err, hash){
      const newUser= new User({
        email: req.body.username,
        password: hash
      })
    
      newUser.save()
      .then(()=>{
        res.render("account")
      })
      .catch((err)=>{
        console.log(err);
      })
    })*/
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/Signup")
      }
      else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/account");
        })
      }
    })

  })

  app.post("/login", function (req, res) {
    /*const username=req.body.username;
    const password=req.body.password;
    User.findOne({email : username})
    .then(function (users){
      if(users){
        bcrypt.compare(password , users.password , function(err, result){
          if(result===true){
            res.render("account")
          }
        })
      }
    })
    .catch((err)=>{
      console.log(err);
    
    })*/

    const user = new User({
      username: req.body.username,
      password: req.body.password
    })

    req.login(user, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/account");
        })
      }
    })

  })

  app.post("/compose",function(req,res){
    const post=new Post({
      title: req.body.name1,
      content: req.body.postbody
    })
    const user=req.user.id;
      post.save()
      .then((rev)=>{
        User.findById(user).then(function(foundUser){
          if (foundUser) {
            foundUser.review=rev;
            foundUser.save().then(function(){
              res.redirect("/");
            });
          }
        }).catch(function(err){
          console.log(err);
        })
      })
      .catch((err)=>{
        console.log(err);
      })
      

  })

  // app.get("/posts/:postId", function (req, res) {
  //   const check = req.params.postId;
  //   Post.findOne({ _id: check })
  //     .then((post) => {
  //       res.render("post", {
  //         title: post.title,
  //         content: post.content
  //       })
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })

  // })


  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });
}
