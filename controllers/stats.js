const express = require('express');
const router = express.Router();
const stats = require('../model/stats');

router.get('/', (req, res) => {
    if (req.body.player_name) {
        stats.getPlayerStats(req.body.player_name).then(stats => {
            if (stats) {
                res.status(200);
                res.json({ status: true, stats });
            } else {
                res.status(404);
                res.json({ status: false, message : "Player not found." });
            }
        }, err => {
            res.status(500);
            res.json({ error: err });
        });
    } else {
        res.status(400)
        return res.json({error:"You must provide player name."})
    }
})

module.exports = router