const router = require("express").Router();
const passport = require("passport");

if (process.env.NODE_ENV === "PROD") {
  //Use SSO if production mode
  router.get("/", passport.authenticate("azure_ad_oauth2", { failureRedirect: "/login/fail" }), (req, res) =>
    res.redirect("/")
  );
  router.get("/callback", passport.authenticate("azure_ad_oauth2", { failureRedirect: "/login/fail" }), (req, res) =>
    res.redirect("/")
  );
} else {
  //Use local strategy if dev mode
  router.get("/", (req, res) => res.render("login.ejs"));
  router.post("/", passport.authenticate("local", { failureRedirect: "/login/fail" }), (req, res) =>
    res.redirect("/user")
  );
}

router.get("/fail", (req, res) => res.send("Oops! Login failed. Try again."));
router.get("/permissions", (req, res) => res.send("Oops! You don't have permission to do that!"));

module.exports = router;
