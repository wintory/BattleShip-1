let chai = require('chai');
let chaiHttp = require('chai-http');
let assert = chai.assert;
let app = require("../../app");
let config = require('../../config');
chai.use(chaiHttp);

describe("Controller API Test", () => {
    before(done=>{
        app.event.on('server_ready', () => {
            done();
        })
    })

    let player_name = "Test_API_Only"
    it("New first game", (done) => {
        chai.request(app.app)
            .post('/game/new')
            .send({ "player_name": player_name })
            .end((err, res) => {
                assert.equal(res.status, 201);
                done();
            })
    });

    it("Can't new game again without ending last match", (done) => {
        chai.request(app.app)
            .post('/game/new')
            .send({ "player_name": player_name })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.status, false);
                done();
            })
    });

    it("Give up last match", (done) => {
        chai.request(app.app)
            .post('/game/giveup')
            .send({ "player_name": player_name })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.status, true);
                done();
            })
    });

    it("Can't give up twice after give up on last match", (done) => {
        chai.request(app.app)
            .post('/game/giveup')
            .send({ "player_name": player_name })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.status, false);
                done();
            })
    });

    it("New game again after give up on last match", (done) => {
        chai.request(app.app)
            .post('/game/new')
            .send({ "player_name": player_name })
            .end((err, res) => {
                assert.equal(res.status, 201);
                assert.equal(res.body.status, true);
                done();
            })
    });

    it("Delete player", (done) => {
        chai.request(app.app)
            .del('/game/deactive')
            .send({ "player_name": player_name })
            .end((err, res) => {
                assert.equal(res.status, 200);
                done();
            })
    });


});