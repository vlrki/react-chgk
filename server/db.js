const mysql = require("mysql");
const config = require("./config.js");

// Create a connection to the database
const pool = mysql.createPool({
    connectionLimit: 5,
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DB
});

pool.getConnection(function (err, connection) {
    if (err) {
        console.log(err);
    }
});

module.exports = pool;