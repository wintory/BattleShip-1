const db = require('../app').db;

exports.getPlayerStats = (player_name) => {
    return new Promise((resolve, reject) => {
        db.getPlayerStatus(player_name).then((stats) => {
            resolve(stats);
        }, err => reject(err))
    })
}