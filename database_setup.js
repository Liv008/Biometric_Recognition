var mysql = require('mysql')

var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    database: "users",
    user: "root",
    password: "password",
});

con.connect((err) => {
    if (err) throw err;
    console.log('MySQL server connected!');
});

module.exports = con