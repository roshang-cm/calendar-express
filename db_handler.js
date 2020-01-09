const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  database: "events",
  user: "root",
  password: ""
});

connection.connect(error => {
  if (error) console.error("MySQL failed to connect, error: ", error);
  else console.log("Connected to MySQL");
});

module.exports = connection;
