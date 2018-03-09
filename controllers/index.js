const express = require('express');
const router = express.Router();

router.use("/game", require('./game'));

module.exports = router