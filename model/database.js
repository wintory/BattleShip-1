let mongo = require('mongodb').MongoClient;
class mongodb {
    constructor(config, callback) {
        this.config = config;
        mongo.connect("mongodb://" + config.user + ":" + config.password + "@" + config.ip + ":" + config.port + "/" + config.database + "?authMechanism=DEFAULT&authSource=" + config.database, (err, db) => {
            if (err) {
                return callback ? callback(err) : err;
            }
            if (callback) callback();
            db.close();
        })
    }

    async connect() {
        let _this = this;
        return new Promise((resolve, reject) => {
            if (_this.db) {
                resolve();
            } else {
                mongo.connect("mongodb://" + this.config.user + ":" + this.config.password + "@" + this.config.ip + ":" + this.config.port + "/" + this.config.database + "?authMechanism=DEFAULT&authSource=" + this.config.database)
                    .then((database) => {
                        _this.db = database;
                        resolve(true);
                    }, (err) => {
                        reject(err.message);
                    }
                    );
            }
        })
    }

    close() {
        this.db.close();
        // delete this;
    }

}

module.exports = mongodb;