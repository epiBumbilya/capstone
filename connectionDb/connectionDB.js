const mysql = require("mysql2");

//Create Connection
const conn = mysql.createConnection({
    host:       'sql6.freesqldatabase.com',
    user:       'sql6588428',
    password:   'Ss1p7Zn5qa',
    database:   'sql6588428'
})

//Connection
conn.connect(err => {
    if(err) throw err;
    console.log('Connected to MySQL');
});

module.exports = conn;