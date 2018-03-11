const express = require('express');
const router = express.Router();
const game_system = require('../model/game_system');

router.post('/new', (req, res) => {
    if (req.body.player_name) {
        game_system.startMatch(req.body.player_name).then(result => {
            if (result) {
                res.status(201);
                res.json({ status: true, message: "New game succesful !." });
            } else {
                res.status(200);
                res.json({ status: false, message: "You not finish your last match yet. " })
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

router.delete('/deactive', (req, res) => {
    if (req.body.player_name) {
        game_system.deactivePlayer(req.body.player_name).then(result => {
            if (result) {
                res.status(200);
                res.json({ status: true, message: "Delete player successful !." });
            } else {
                res.status(404);
                res.json({ status: false, message: "Player name doesn't exist." })
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

router.post('/giveup', (req, res) => {
    if (req.body.player_name) {
        game_system.giveup(req.body.player_name).then(({ err, result }) => {
            if (err) {
                res.status(404)
                return res.json({ status: false, message: err });
            }
            if (result) {
                res.status(200);
                res.json({ status: true, message: "You just give up on your last match !." });
            } else {
                res.status(200);
                res.json({ status: false, message: "You have no playing match." })
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

router.post('/shoot/:x/:y', (req, res) => {
    let x = parseInt(req.params.x);
    let y = parseInt(req.params.y);
    if(isNaN(x) || isNaN(y)){
        res.status(400);
        return res.json({error:"Position must be integer."})
    }
    if (req.body.player_name) {
        game_system.shoot(req.body.player_name, x, y).then(({ err, not_found, msg, win }) => {
            if (err) {
                if (not_found) {
                    res.status(404);
                }
                return res.json({ status: false, message: err })
            }
            res.status(200);
            res.json({ status: true, message: msg, win })
        }, err => {
            res.status(500);
            res.json({ error: err });
        })
    } else {
        res.status(400)
        return res.json({error:"You must provide player name."})
    }
})

router.get('/shoot/history', (req, res) => {
    if (req.body.player_name) {
        game_system.getShootHistory(req.body.player_name).then(({ err, history }) => {
            if (err) {
                res.status(404);
                return res.json({ status: false, message: err })
            }
            if (!history) {
                res.status(404);
                return res.json({ status: false, message: "Shoot history not found." })
            }
            res.status(200);
            res.json({ status: true, history })
        }, err => {
            res.status(500);
            res.json({ error: err });
        })
    } else {
        res.status(400)
        return res.json({error:"You must provide player name."})
    }
})

router.get('/match/history', (req, res) => {
    if (req.body.player_name) {
        game_system.getMatchHistory(req.body.player_name).then(({ err, history }) => {
            if (err) {
                res.status(404);
                return res.json({ status: false, message: err })
            }
            if (!history) {
                res.status(404);
                return res.json({ status: false, message: "Match history not found." })
            }
            res.status(200);
            res.json({ status: true, history })
        }, err => {
            res.status(500);
            res.json({ error: err });
        })
    } else {
        res.status(400)
        return res.json({error:"You must provide player name."})
    }
})

module.exports = router