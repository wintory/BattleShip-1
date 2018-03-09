const express = require('express');
const router = express.Router();
const game_system = require('../model/game_system');

router.post('/new', (req, res) => {
    game_system.startMatch(req.body.player_name).then(result => {
        res.status(200);
        if (result) {
            res.json({ status: true, message: "New game succesful !." });
        } else {
            res.json({ status: false, message: "You not finish your last match yet. " })
        }
    }, err => {
        res.status(500);
        res.json({ error: err });
    });
})

router.delete('/deactive', (req, res) => {
    if (req.body.player_name) {
        game_system.deactivePlayer(req.body.player_name).then(result => {
            res.status(200);
            if (result) {
                res.json({ status: true, message: "Delete player successful !." });
            } else {
                res.json({ status: false, message: "Player name doesn't exist." })
            }
        }, err => {
            res.status(500);
            res.json({ error: err });
        });
    }
})

module.exports = router