let mongodb = require('./model/database');
let config = require('./config');
let express = require('express');
let EventEmitter = require('events');
let myEmitter = new EventEmitter();
let app = express();
let bodyParser = require('body-parser')

let db_server = new mongodb(config.Database, (err) => {
    if (err) {
        console.log(`Cannot connect database : ${err}`);
    } else {
        console.log("Database connected succesful.");
        db_server.connect(config.Database.database).then((connected) => {
            if (connected) {
                app.use(bodyParser.json());
                app.use(bodyParser.urlencoded({ extended: true }));
                app.use(require('./controllers'))
                app.listen(config.api.port, function () {
                    console.log(`Battleship listen on port ${config.api.port}`);
                    myEmitter.emit('server_ready');
                })
            }
        });
    }
});

module.exports.db = db_server;
module.exports.app = app;
module.exports.event = myEmitter;