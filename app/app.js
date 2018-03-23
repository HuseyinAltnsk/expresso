const env = require("dotenv").config();
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const app = express();

mongoose.connect("mongodb://localhost:27017");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(favicon(path.join(__dirname, "public", "favicon.png")));
app.use(logger("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "add-a-cookie-secret-here",
    resave: false,
    saveUninitialized: false,
    maxAge: 100000
  })
);
app.use(express.static(path.join(__dirname, "public")));
//Setup up oauth
app.use(passport.initialize());
//Setup sessions handling in passport
app.use(passport.session());
//Setup routing.
app.use(require("./routes"));
/*
  Authentication
*/

//We aren't using a database, so no need to do any real serailization.
passport.serializeUser(function(user, done) {
  done(null, user.unique_name);
});

//Same as above.
passport.deserializeUser(function(id, done) {
  done(null, { id });
});

//For The Admin Panel
passport.use(
  new localStrategy((username, password, done) => {
    let user;
    if (username === "user" && password === "user") {
      user = { unique_name: "hr@davidson.edu" };
    }
    return done(null, user);
  })
);

// //For Davidson Account Holders
// passport.use(
//   new oauth2(
//     {
//       callbackURL: "/login/callback",
//       clientID: process.env.OAUTH2_APP_ID,
//       clientSecret: process.env.OAUTH2_SECRET,
//       resource: process.env.OAUTH2_RESOURCE_ID,
//       tenant: process.env.OAUTH2_TENANT
//     },
//     (token, tokenSecret, params, profile, done) => {
//       let user = jwt.decode(params.access_token);
//       //Pass user to be serialized.
//       done(null, user);
//     }
//   )
// );

module.exports = app;
