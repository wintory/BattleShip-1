const express = require('express');
const router = express.Router();
const stats = require('../model/stats');

router.post('/', (req, res) => {
    if (req.body.player_name) {
        stats.getPlayerStats(req.body.player_name).then(stats => {
            if (stats) {
                res.status(201);
                res.json({ status: true, stats });
            } else {
                res.status(200);
                res.json({ status: false, message : "Player not found." });
            }
        }, err => {
            res.status(500);
            res.json({ error: err });
        });
    }
})

module.exports = router