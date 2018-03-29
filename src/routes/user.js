const router = require("express").Router();

router.get("/", (req, res, next) => {
  /**
   * This is the route https://locahost:8080/user
   * When a logged in user navigates to it, Express parses the session information (which holds
   * information about the user) and then passes that information in as req.user. We can then, pass that information
   * into an HTML for rendering.
   */
  res.render("user", { user: req.user });
});

module.exports = router;
