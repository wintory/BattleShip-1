let mongodb = require('./model/database');
let config = require('./config');
let db_server = new mongodb(config.Database, (err)=>{
    if(err){
        console.log(`Cannot connect database : ${err}`);
    }else {
        db_server.connect();
        console.log("Database connected succesful.");
    }
});