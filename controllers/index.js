const express = require('express');
const router = express.Router();

router.use("/game", require('./game'));
router.use("/stats", require('./stats'))
module.exports = router