const db = require('../app').db;
const game_config = require('../config').game;
const aspect = { horizontal: 0, vertical: 1 };

///////////////////////////
// Check config
///////////////////////////
! function () {
    let shutdown = (msg) => {
        console.error(msg);
        process.exit();
    }
    let ship_amount = 0;
    let ship_occupied = 0;
    let max_occupied = Math.pow(game_config.size, 2) * 0.25;

    if (game_config.size < 10) { // check game size
        shutdown("Game size must greater or equal 10.");
    }
    for (let ship of game_config.ship_data) {
        ship_amount += ship.amount;
        ship_occupied += ship.amount * ship.size;
    }
    if (ship_amount <= 0) {
        shutdown("Must have at least one ship.");
    } else if (ship_occupied > max_occupied) {
        shutdown(`Overall ship occupied must less than ${max_occupied}.`)
    }
}()
///////////////////////////

exports.startMatch = (player_name) => {
    return new Promise((resolve, reject) => {
        db.getPlayerData(player_name).then((data) => {
            if (data) {
                if (data.match.filter(match => !match.ending).length == 0) {
                    // don't have playing match
                    db.createNewMatch(player_name, generateMatch()).then((result) => {
                        if (result) {
                            resolve({map_size:game_config.size});
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
                                resolve({map_size:game_config.size});
                            }
                        }, err => reject(err))
                    }
                }, err => reject(err))
            }
        })
    })
}

exports.deactivatePlayer = (player_name) => {
    return new Promise((resolve, reject) => {
        db.deletePlayer(player_name).then((result) => {
            resolve(result.result.n == 1);
        }, err => reject(err))
    })
}

exports.giveup = (player_name) => {
    return new Promise((resolve, reject) => {
        checkPlayerData(player_name).then((result) => {
            if (result) {
                db.endMatch(player_name).then(result => {
                    resolve({ result: result ? result.result.ok == 1 : false });
                }, err => reject(err))
            } else {
                resolve({ err: "Player not found." })
            }
        }, err => reject(err))
    })
}

exports.shoot = (player_name, x, y) => {
    return new Promise((resolve, reject) => {
        checkPlayerData(player_name).then((result) => {
            if (result) { // have player data
                let playing_match = result.match.filter(match => !match.ending);
                if (result.match && playing_match.length > 0) { // have playing match
                    if (x >= playing_match[0].map_size || y >= playing_match[0].map_size ||
                        x < 0 || y < 0) {
                        return resolve({ err: `Shoot position over map !. You must shoot between (0,0) till (${playing_match[0].map_size - 1},${playing_match[0].map_size - 1})` });
                    } else {
                        db.checkShooted(player_name, x, y).then(shoot_duplicate => {
                            if (!shoot_duplicate) {
                                getShootPosition(player_name, x, y).then(ocean => {
                                    if (ocean) { // hit something 
                                        let hit_index = ocean.findIndex(ship => (ship.x == x) && (ship.y == y))
                                        ocean[hit_index].hit = true;
                                        db.updateShootedShip(player_name, ocean).then((result) => { // update ocean's hit data
                                            if (checkIfShipSunk(ocean, ocean[hit_index].ship_id)) {
                                                sunkShip(player_name, ocean[hit_index].ship_id).then(({ err, ship, win }) => { // update ship sunk
                                                    if (err) return resolve({ err });
                                                    resolve({ err: undefined, msg: win ? `Win ! You completed the game in ${win.turns} moves` : `You just sank the ${ship.ship_name}`, win });
                                                })
                                            } else {
                                                resolve({ err: undefined, msg: "Hit" });
                                            }
                                        })
                                    } else { // miss
                                        resolve({ err: undefined, msg: "Miss" });
                                    }
                                    db.addShootData(player_name, x, y, ocean ? true : false); // updated shooted history
                                })
                            } else {
                                return resolve({ err: `The position (${x},${y}) already shooted.` });
                            }
                        }, err => reject(err));
                    }
                } else {
                    resolve({ err: "Match playing not found.", not_found: true })
                }
            } else {
                resolve({ err: "Player not found.", not_found: true });
            }
        })
    })
}

exports.getShootHistory = (player_name) => {
    return new Promise((resolve, reject) => {
        checkPlayerData(player_name).then(exist => {
            if (exist) {
                db.getShootHistory(player_name).then(history => {
                    resolve({ history });
                }, err => reject(err));
            } else {
                resolve({ err: "Player not found." });
            }
        })
    })
}

exports.getMatchHistory = (player_name) => {
    return new Promise((resolve, reject) => {
        checkPlayerData(player_name).then(exist => {
            if (exist) {
                db.getHistoryMatch(player_name).then(match_history => {
                    resolve({ history: match_history });
                }, err => reject(err))
            } else {
                resolve({ err: "Player not found." });
            }
        })
    })
}

function checkPlayerData(player_name) {
    return new Promise((resolve, reject) => {
        db.getPlayerData(player_name).then(result => {
            resolve(result);
        }, err => reject(err));
    })
}

function getShootPosition(player_name, x, y) {
    return new Promise((resolve, reject) => {
        db.getMatchData(player_name).then((match_data) => {
            let ocean = match_data.ocean;
            let isHit = ocean.filter(ship_position => ship_position.x == x && ship_position.y == y).length > 0;
            resolve(isHit ? ocean : undefined);
        })
    })
}

function checkIfShipSunk(ocean, ship_id) {
    let ship_alive = ocean.filter(ship => (ship.ship_id == ship_id) && !ship.hit); // get ship that not hit.
    return ship_alive.length == 0;
}

function sunkShip(player_name, ship_id) {
    return new Promise((resolve, reject) => {
        db.getMatchData(player_name).then(match_data => {
            let ships = match_data.ships;
            let sunk_index = ships.findIndex(ship => ship.id == ship_id);
            ships[sunk_index].sunk = true;
            db.updateShips(player_name, ships).then((result) => {
                if (result) {
                    db.decreaseShipLeft(player_name).then(() => {
                        if (match_data.ship_left - 1 == 0) { // no ship left
                            db.endMatch(player_name).then(result => {
                                db.increaseWin(player_name);
                                resolve({ err: undefined, ship: ships[sunk_index], win: { turns: match_data.turn } });
                            }, err => reject(err))
                        } else {
                            resolve({ err: undefined, ship: ships[sunk_index] });
                        }
                    }, err => reject(err));
                } else {
                    resolve({ err: "Ocean data not updated." });
                }
            })
        })
    })
}

function generateMatch() {
    let match_data = {
        turn: 1,
        map_size : game_config.size,
        ship_left: 0,
        ending: false,
        shooted: [],
        ships: [],
        ocean: [],
    };
    let auto_id = idMaker();
    for (let ship of game_config.ship_data) {
        let amount = 0;
        ship.amount = ship.amount < 0 ? 0 : ship.amount; // ship.amount can't be negative
        while (amount < ship.amount) {// while generated ship less than amount of each type
            let ship_generate = { size: ship.size };
            do {
                ship_generate.choose_position = {
                    x: Math.round(Math.random() * (game_config.size - 1)),
                    y: Math.round(Math.random() * (game_config.size - 1))
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
        }
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