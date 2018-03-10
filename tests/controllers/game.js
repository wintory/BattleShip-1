let chai = require('chai');
let chaiHttp = require('chai-http');
let assert = chai.assert;
let app = require("../../app");
let config = require('../../config');
chai.use(chaiHttp);

describe("Starting API", () => {
    let player_name = "Test_API_Only"
    
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
                    done();
                })
        });

        it("(/game/new) Can't new game again without ending last match", (done) => {
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

    describe("Delete player data", ()=>{
        it("(/game/deactive) Delete player", (done) => {
            chai.request(app.app)
                .del('/game/deactive')
                .send({ "player_name": player_name })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                })
        });
    })
})

