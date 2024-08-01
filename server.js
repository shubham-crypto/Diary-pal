require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authMiddleware = require('./authMiddleware');
const saltRounds=10;
const path = require('path');
const MongoStore = require('connect-mongo');

const JWT_SECRET = process.env.JWT_SECRET;

// const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "We vow to be your steadfast companion, helping you navigate through feelings of loneliness and stress with unwavering support. Since the beginning, we have made every conceivable effort to maintain the confidentiality and security of your personal experiences and emotions. Our commitment is to safeguard your privacy while providing a nurturing environment for you to thrive.Our dedication goes beyond mere assistance; we are here to be a constant source of encouragement and positivity in your life. We strive to uplift your spirits daily, ensuring you feel valued and supported. Whether you're facing challenges or celebrating successes, our goal is to be a reliable source of comfort and motivation.Together, we are committed to helping you cultivate a life filled with joy and resilience, offering the companionship and understanding you need to flourish. Your well-being is our top priority, and we are here to stand by you every step of the way.";
const app = express();
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200,
}));
app.use('/diary', authMiddleware);
app.use(express.json()); 
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const mongoStore = MongoStore.create({
  mongoUrl: 'mongodb+srv://mshubham0723:Shubham23702@cluster0.lhcr991.mongodb.net/diaryDB?retryWrites=true&w=majority&appName=Cluster0', 
  collectionName: 'sessions', // Collection name for storing sessions
  ttl: 14 * 24 * 60 * 60 // Time to live in seconds (14 days)
});
app.use(session({
  secret: 'Our little secret',
  resave: false ,
  saveUninitialized: false,
  store: mongoStore,
  cookie: { secure: false } // Set to true if using HTTPS
}));

var ash=["google"];

app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://mshubham0723:Shubham23702@cluster0.lhcr991.mongodb.net/diaryDB?retryWrites=true&w=majority&appName=Cluster0');
  console.log("Connected");

  const postSchema = new mongoose.Schema({
    title: String,
    content: String
  })
  const Post = mongoose.model("Post", postSchema);

  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    hash: String,
    salt: String,
    googleId: String,
    secret: String,
    reviews: [postSchema]
  });

  //userSchema.plugin(encryption,{secret : process.env.SECRETS , encryptedFields : ["password"]});
 
  userSchema.plugin(findOrCreate);

  const User = new mongoose.model("User", userSchema)


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
    callbackURL: "http://localhost:5000/auth/google/secrets",
    useProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback: true
  },
    function (request, accessToken, refreshToken, profile, done) {
      User.findOrCreate({ googleId: profile.id, email: profile.emails[0].value }, function (err, user) {
        if (err) {
          console.error('Find or Create Error:', err);
          return done(err);
        }
        return done(null, user);
      });
    }
  ));

  app.get('/auth/google', (req, res, next) => {
    
    req.session.save(err => {
        if (err) {
            console.error('Session save error:', err);
            res.status(500).send('Error saving session');
        } else {
            passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
        }
    });
  });

  
  app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication
      const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token);
          
       /// res.redirect('/auth/redirect'); 
       res.redirect('http://localhost:3000/account')
    }
  );

  app.get('/diary', authMiddleware,async (req, res) => {
    try {
      console.log(req.user.id)
      const  userId = req.user.id; // Extract user ID from JWT payload
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Server error');
    }
  });

  app.get("/about", function (req, res) {
    res.send(aboutContent)
  })

  app.get('/account', authMiddleware,(req, res) => {
    try {
      User.findById(req.user.id)
        .populate('reviews')
        .then((foundUser) => {
          if (foundUser) {
            res.json({
              secret: foundUser.secret || 'No secret found',
              reviews: foundUser.reviews || [],
            });
          } else {
            res.status(404).json({ message: 'User not found' });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
        });
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Unauthorized' });
    }
  });
  
  app.post('/submit', authMiddleware, (req, res) => {
    const userId = req.user.id;  // Extracted from the token
    const submittedSecret = req.body.secret;  // Extracted from the request body
  
    User.findById(userId)
      .then((foundUser) => {
        if (foundUser) {
          foundUser.secret = submittedSecret;
          return foundUser.save();
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      })
      .then(() => {
        res.status(200).json({ message: 'Secret submitted successfully' });
      })
      .catch((err) => {
        console.error('Error submitting secret:', err);
        res.status(500).json({ message: 'Server error' });
      });
  });


  app.post('/Signup', async (req, res) => {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email});
        
        if (existingUser) {
            // User already exists
            return res.status(400).json({ message: 'User already exists' });
        }
        // Generate a salt
        const salt = await bcrypt.genSalt(saltRounds);

        // Generate a hash
        const hash = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            email: email,
            hash: hash,
            salt: salt
        });

        // Save the user
        await newUser.save();
        // Generate JWT token
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        return res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find user by email
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: ' not registered' });
        }
        const isMatch = await bcrypt.compare(password, user.hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        // Send the token in the response
        res.cookie('token', token, { httpOnly: true });
        return res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            email: user.email,
            id: user._id,
            // Include any other user information you want to return
          },
        });

    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

  
app.post('/compose', authMiddleware, async (req, res) => {
  const { name, postBody } = req.body;
  const userId = req.user.id; // Extracted from the token by authMiddleware

  if (!name || !postBody) {
    return res.status(400).json({ message: 'Name and post body are required' });
  }

  try {
    const user = await User.findById(userId); // Find the logged-in user

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPost = new Post({
      title: name,
      content: postBody
    });

    // Update the user's review field with the new post
    user.reviews.push(newPost);
    await user.save();

    res.status(200).json({ message: 'Post saved successfully', post: newPost });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: 'Server error' });
  }
 });


  app.listen(5000, function () {
    console.log("Server started on port 5000");
  });
}
