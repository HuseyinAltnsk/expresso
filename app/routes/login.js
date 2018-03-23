const router = require("express").Router();
const passport = require("passport");

router.get("/local", (req, res) => res.render("login/local"));

router.post("/local", passport.authenticate("local", { failureRedirect: "/login/local" }), (req, res) =>
  res.redirect("/")
);

module.exports = router;
