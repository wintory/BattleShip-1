let chai = require('chai');
let chaiHttp = require('chai-http');
let assert = chai.assert;
let app = require("../../app");
let config = require('../../config');
chai.use(chaiHttp);

describe("Starting API", () => {
    let player_name = "Test_API_Only";
    let not_exist_player = "Test_Not_Exist_Player";
    let shoot_count = 0;
    let stats = {
        win: 0,
        hit: 0,
        miss: 0,
        sunk: 0
    }
    before(done => {
        app.event.on('server_ready', () => {
            done();
        })
    })

    describe("Controller API Test", () => {
        it("(/game/new) New first game", (done) => {
            chai.request(app.app)
                .post('/game/new')
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.status, true);
                    done();
                })
        });

        it("(/game/new) Can't new game without sending player_name", (done) => {
            chai.request(app.app)
                .post('/game/new')
                .send()
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });

        it("(/game/new) Can't new game again without sending ending last match", (done) => {
            chai.request(app.app)
                .post('/game/new')
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, false);
                    done();
                })
        });

        it("(/game/giveup) Give up last match", (done) => {
            chai.request(app.app)
                .post('/game/giveup')
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, true);
                    done();
                })
        });

        it("(/game/giveup) Can't give up by not exist player", (done) => {
            chai.request(app.app)
                .post('/game/giveup')
                .send({ "player_name": not_exist_player })
                .end((err, res) => {
                    assert.equal(res.status, 404);
                    assert.equal(res.body.status, false);
                    done();
                })
        });

        it("(/game/giveup) Can't give without sending player name", (done) => {
            chai.request(app.app)
                .post('/game/giveup')
                .send()
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });

        it("(/game/giveup) Can't give up twice after give up on last match", (done) => {
            chai.request(app.app)
                .post('/game/giveup')
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, false);
                    done();
                })
        });

        it("(/game/new) New game again after give up on last match", (done) => {
            chai.request(app.app)
                .post('/game/new')
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.status, true);
                    done();
                })
        });

    });

    describe("Gameplay test", () => {
        it(`(/game/shoot/0/0) shooting in current match [size ${config.game.size}x${config.game.size}]`, (done) => {
            chai.request(app.app)
                .post(`/game/shoot/${0}/${0}`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, true);
                    shoot_count++;
                    if (res.body.message == "Hit") {
                        stats.hit++;
                    } else if (res.body.message.indexOf('You just sank the') > -1) {
                        stats.hit++;
                        stats.sunk++;
                    } else if (res.body.message == "Miss") {
                        stats.miss++;
                    }
                    done();
                })
        });

        it(`(/game/shoot/0/0) Can't shooting same point [size ${config.game.size}x${config.game.size}]`, (done) => {
            chai.request(app.app)
                .post(`/game/shoot/${0}/${0}`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, false);
                    done();
                })
        });

        it(`(/game/shoot/-1/-1) Can't shooting over the map [size ${config.game.size}x${config.game.size}]`, (done) => {
            chai.request(app.app)
                .post(`/game/shoot/${-1}/${-1}`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, false);
                    done();
                })
        });

        it(`(/game/shoot/0/0) Can't shooting without sending player_name`, (done) => {
            chai.request(app.app)
                .post(`/game/shoot/${0}/${0}`)
                .send()
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });

        it(`(/game/shoot/test_x/test_y) Can't shooting with string position`, (done) => {
            chai.request(app.app)
                .post(`/game/shoot/test_x/test_y`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });

        it(`(/game/shoot/history?player_name=${player_name}) Get shoot history (0,0)`, (done) => {
            chai.request(app.app)
                .get(`/game/shoot/history?player_name=${player_name}`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, true);
                    assert.equal(res.body.history.length, 1)
                    assert.equal(res.body.history[0].x, 0);
                    assert.equal(res.body.history[0].y, 0);
                    done();
                })
        });

        it(`(/game/shoot/history?player_name=${not_exist_player}) Can't get shoot history of not exist player`, (done) => {
            chai.request(app.app)
                .get(`/game/shoot/history?player_name=${not_exist_player}`)
                .send({ "player_name": not_exist_player })
                .end((err, res) => {
                    assert.equal(res.status, 404);
                    assert.equal(res.body.status, false);
                    done();
                })
        });

        it(`(/game/shoot/history) Can't get shoot history without sending player name`, (done) => {
            chai.request(app.app)
                .get(`/game/shoot/history`)
                .send()
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });

        describe("Gameplay until end", () => {
            let is_ending = false
            for (let x = 0; x < config.game.size; x++) {
                for (let y = 0; y < config.game.size; y++) {
                    it(`(/game/shoot/${x}/${y})`, done => {
                        chai.request(app.app)
                            .post(`/game/shoot/${x}/${y}`)
                            .send({ "player_name": player_name })
                            .end((err, res) => {
                                if (!is_ending) {
                                    assert.equal(res.status, 200);
                                    if (res.body.status) {
                                        shoot_count++;
                                        if (res.body.message == "Hit") {
                                            stats.hit++;
                                        } else if (res.body.message.indexOf('You just sank the') > -1) {
                                            stats.hit++;
                                            stats.sunk++;
                                        } else if (res.body.message == "Miss") {
                                            stats.miss++;
                                        }
                                    }
                                    if (res.body.win) {
                                        console.log(`Game ending here ${res.body.win.turns} turns. `);
                                        // last ship was sunk now
                                        stats.hit++;
                                        stats.sunk++;
                                        stats.win += 1;
                                        is_ending = true;
                                    }
                                    done();
                                } else { // Game already done it shouldn't find playing match
                                    assert.equal(res.status, 404);
                                    assert.equal(res.body.status, false);
                                    done();
                                }
                            })
                    })
                }
            }
        })
    })

    describe("Player stats test", () => {
        it('(/stats) Get status of player', (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, true);
                    done();
                })
        })

        it("(/stats) Can't get status of not exist player", (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, true);
                    done();
                })
        })

        it("(/stats) Can't get status without sending player name", (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send()
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        })

        it(`Check stats for shooting count`, (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stats.hit + res.body.stats.miss, shoot_count);
                    done();
                })
        })

        it(`Check stats for hit`, (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stats.hit, stats.hit);
                    done();
                })
        })

        it(`Check stats for miss`, (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stats.miss, stats.miss);
                    done();
                })
        })

        it(`Check stats for sunk`, (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stats.sunk, stats.sunk);
                    done();
                })
        })

        it(`Check stats for win match`, (done) => {
            chai.request(app.app)
                .post(`/stats`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stats.win, stats.win);
                    done();
                })
        })
    })

    describe("Get match history", () => {
        it(`(/game/match/history?player_name=${player_name}) Get match history `, (done) => {
            chai.request(app.app)
                .get(`/game/match/history?player_name=${player_name}`)
                .send({ "player_name": player_name })
                .end((err, res) => {
                    let last_match = res.body.history[res.body.history.length - 1];
                    assert.equal(res.status, 200);
                    assert.equal(res.body.status, true);
                    // assert.equal(last_match.turn -1, shoot_count);
                    assert.equal(last_match.ship_left, 0);
                    assert.equal(last_match.ending, true);
                    done();
                })
        });

        it(`(/game/match/history?player_name=${not_exist_player}) Can't get match history of not exist player`, (done) => {
            chai.request(app.app)
                .get(`/game/match/history?player_name=${not_exist_player}`)
                .send({ "player_name": not_exist_player })
                .end((err, res) => {
                    assert.equal(res.status, 404);
                    assert.equal(res.body.status, false);
                    done();
                })
        });

        it("(/game/match/history) Can't get match history without sending player name", (done) => {
            chai.request(app.app)
                .get('/game/match/history')
                .send()
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });
    })

    describe("Delete player test", () => {
        it("(/game/deactive) Delete player", (done) => {
            chai.request(app.app)
                .del('/game/deactive')
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                })
        });

        it("(/game/deactive) Can't delete not exist player", (done) => {
            chai.request(app.app)
                .del('/game/deactive')
                .send({ "player_name": not_exist_player })
                .end((err, res) => {
                    assert.equal(res.status, 404);
                    done();
                })
        });

        it("(/game/deactive) Can't delete player data without sending player name", (done) => {
            chai.request(app.app)
                .del('/game/deactive')
                .send()
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });
    })
})

