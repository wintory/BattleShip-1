const db = require('../app').db;
const game_config = require('../config').game;
const aspect = { horizontal: 0, vertical: 1 };
// Add body-parser and export database
// Add game config data

exports.startMatch = (player_name) => {
    return new Promise((resolve, reject) => {
        db.getPlayerData(player_name).then((data) => {
            if (data) {
                if (data.match.filter(match => !match.ending).length == 0) {
                    // don't have playing match
                    db.createNewMatch(player_name, generateMatch()).then((result) => {
                        if (result) {
                            resolve(true);
                        }
                    }, err => reject(err))
                } else {
                    // have playing match
                    resolve(false);
                }
            } else {
                db.registerNewPlayer(player_name).then((result) => {
                    if (result.result.ok) {
                        db.createNewMatch(result.ops[0].player_name, generateMatch()).then((result) => {
                            if (result) {
                                resolve(true);
                            }
                        }, err => reject(err))
                    }
                }, err => reject(err))
            }
        })
    })
}

exports.deactivePlayer = (player_name) => {
    return new Promise((resolve, reject) => {
        db.deletePlayer(player_name).then((result) => {
            resolve(result.result.ok == 1);
        }, err => reject(err))
    })
}

exports.giveup = (player_name)=>{
    return new Promise((resolve,reject)=>{
        db.giveupMatch(player_name).then(result =>{
            resolve(result ? result.result.ok == 1 : false);
        }, err => reject(err))
    })
}



function generateMatch() {
    let match_data = {
        turn: 0,
        ship_left: 0,
        ending: false,
        shooted: [],
        ships: [],
        ocean: [],
    };
    let auto_id = idMaker();
    for (let ship of game_config.ship_data) {
        let amount = 0;
        do {
            let ship_generate = { size: ship.size };
            do {
                ship_generate.choose_position = {
                    x: Math.round(Math.random() * game_config.size),
                    y: Math.round(Math.random() * game_config.size)
                };
                ship_generate.ship_aspect = Math.round(Math.random());
            } while (!isLegal(ship_generate, match_data.ocean))
            // increment id
            ship_generate.id = auto_id.next().value;
            // add ship to ships
            match_data.ships.push({
                id: ship_generate.id,
                ship_name: ship.name,
                sunk: false
            })
            // add ship position to ocean
            for (let i = 0; i < ship_generate.size; i++) {
                let ship_data = {
                    x: ship_generate.choose_position.x,
                    y: ship_generate.choose_position.y,
                    ship_id: ship_generate.id,
                    hit: false
                }
                ship_generate.ship_aspect == aspect.horizontal ? ship_data.x += i : ship_data.y += i;
                match_data.ocean.push(ship_data);
            }
            match_data.ship_left++;
            amount++;
        } while (amount < ship.amount) // while generated ship less than amount of each type
    }
    return match_data;
}

function* idMaker() {
    var id = 1
    while (true) { yield id++ }
}

function isLegal(ship, ocean) {
    let start_detect = {
        x: ship.choose_position.x - 1,
        y: ship.choose_position.y - 1,
    }
    let end_detect = {
        x: ship.choose_position.x,
        y: ship.choose_position.y,
    }

    if (ship.ship_aspect == aspect.horizontal) { // set end position by ship aspect
        if (ship.choose_position.x + (ship.size - 1) > (game_config.size - 1)) { //check if ship position over map
            return false;
        }
        end_detect.x += ship.size;
        end_detect.y += 1;
    } else {
        if (ship.choose_position.y + (ship.size - 1) > (game_config.size - 1)) { //check if ship position over map
            return false;
        }
        end_detect.x += 1;
        end_detect.y += ship.size;
    }
    for (let ship_position of ocean) { // for every ship position in ocean
        //check if any ship overlap or adjacent in detect zone
        if (ship_position.x >= start_detect.x &&
            ship_position.x <= end_detect.x &&
            ship_position.y >= start_detect.y &&
            ship_position.y <= end_detect.y) {

            return false;
        }
    }
    return true;
}