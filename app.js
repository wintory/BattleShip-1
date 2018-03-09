let mongodb = require('./model/database');
let config = require('./config');
let express = require('express');
let app = express();

app.use(require('./controllers'))

let db_server = new mongodb(config.Database, (err) => {
    if (err) {
        console.log(`Cannot connect database : ${err}`);
    } else {
        db_server.connect().then((connected) => {
            if (connected) {
                app.listen(config.api.port, function () {
                    console.log('Battleship listen on port 3000');
                })
            }
        });
        console.log("Database connected succesful.");
    }
});
