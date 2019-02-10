var express = require('express');
var router = express.Router();
var connection = require('../database/mysql')



/* GET home page. */
router.get('/', function(req, res, next) {
    
    connection.query('SELECT * FROM todo_task.task', function (err, rows, fields) {
      if (err) throw err
    
      console.log('The solution is: ', rows[0])
      res.send(rows[0]);
    })
    
    //connection.end()
});

module.exports = router;