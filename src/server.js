/*
  Dependencies
*/

// These are all third-party packages that our app requires to run. We will use them in the code below.
const env = require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const favicon = require("serve-favicon");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const oauth2 = require("passport-azure-ad-oauth2");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

/*
  Setup Models and Database
*/

//initialize users models
require("./models/User");
// connect to database
mongoose.connect(process.env.MONGODB_URI);

/*
 Intialize Email
*/

const transporter = nodemailer.createTransport({
  debug: true,
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/*
  Setup Server
*/
const app = express();
//Serve favicon
app.use(favicon(path.join(__dirname, "./public", "favicon.png")));

/**
 * When a client request comes in, we have to know how to parse it. The below functions do the parsing we need.
 */

app.use(bodyParser.json());
//Parse URL codes
app.use(bodyParser.urlencoded({ extended: true }));
//Setup cookies
app.use(cookieParser());
// Setup sessions.
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 100000
  })
);

/**
 * We use views to render the HTML that we send to the client.
 * Each file in the views directory compiles down to a webpage.
 */

//Setup views for admin panel.
app.set("views", __dirname + "/views");
//Use http://ejs.co/ as our rendering engine.
app.set("view engine", "ejs");

/**
 * We need a way to handle login and authentication.
 * http://www.passportjs.org/ does this for us. Here, we initialize the package.
 */

// Setup up passport
app.use(passport.initialize());
// Setup sessions handling in passport.
app.use(passport.session());
// Add transporter email object to res
app.use((req, res, next) => {
  res.locals.transporter = transporter;
  next();
});
// Define static folder. This is where we will put images and other files.
// Note, you don't have to be logged in to access these! Be careful what you put in public.
app.use(express.static(path.join(__dirname, "./public")));
// Setup logs. https://en.wikipedia.org/wiki/Server_log
app.use(morgan("combined"));

/**
 * After we setup HTML rendering but before we require authentication, create a login route.
 * If we created the login route after we initialize authentication,
 * you would be required to login in order to login. Absurd!
 */

//Setup login routes.
app.use("/login", require("./routes/login"));

/*
Authentication
*/

/**
 * These settings allow our application to link in with Davidson SSO in production or a local login in DEV.
 * You don't need to know how this works.
 */

let fakeUser = require("./utils/fakeuser");

// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
passport.serializeUser((user, done) => {
  done(null, user.unique_name);
});

// Same as above.
passport.deserializeUser((id, done) => {
  done(null, fakeUser);
});

if (process.env.NODE_ENV === "PROD") {
  passport.use(
    new oauth2(
      {
        callbackURL: "/login/callback",
        clientID: process.env.OAUTH2_APP_ID,
        clientSecret: process.env.OAUTH2_SECRET,
        resource: process.env.OAUTH2_RESOURCE_ID,
        tenant: process.env.OAUTH2_TENANT
      },
      (token, tokenSecret, params, profile, done) => {
        let user = jwt.decode(params.access_token);
        //Pass user to be serialized.
        done(null, user);
      }
    )
  );
} else {
  passport.use(
    new localStrategy((username, password, done) => {
      if (username === "admin" && password === "admin") done(null, fakeUser);
    })
  );
}

// Force all users to login.
app.use((req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.redirect("/login");
});

// Force all users to login.
app.use("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

/*
  Serve Data
*/

// We've already setup the login route, but now let's setup everything else.
// These routes require the user be logged in to access.
app.use(require("./routes"));

/*
Start Server
*/

if (process.env.NODE_ENV === "PROD") {
  //When in production environment, setup HTTPS server.
  //https://en.wikipedia.org/wiki/HTTPS
  const privateKey = fs.readFileSync("/etc/ssl/certs/expresso_davidson_edu.key", "utf8");
  const certificate = fs.readFileSync("/etc/ssl/certs/expresso_davidson_edu.cer", "utf8");
  https.createServer({ key: privateKey, cert: certificate }, app).listen(process.env.PORT || 443, () => {});
} else {
  // When in development mode, don't use TLS. Serve on port http://localhost:8080 .
  app.listen(process.env.SERVER_PORT || 8080, () =>
    console.log("DEV MODE: Serving data to port " + process.env.SERVER_PORT || 8080)
  );
}
