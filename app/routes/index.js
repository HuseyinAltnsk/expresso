const router = require("express").Router();

router.use("/", require("./home"));
router.use("/user", require("./users"));

module.exports = router;
