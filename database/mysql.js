var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'compte',
  password : 'CompteMySQL',
  database : 'todo_task'
});

connection.connect()

module.exports = connection;