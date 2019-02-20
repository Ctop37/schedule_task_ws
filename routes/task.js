var express = require('express');
var router = express.Router();
var connection = require('../database/mysql')

const { check } = require('express-validator/check');

var query_get_task_by_id = "SELECT * FROM todo_task.task t WHERE t.id=? ORDER BY t.id asc";
var query_insert_history_task = "INSERT INTO todo_task.task_history (id_task, date, util) VALUES (?, now(), ?)"


var id;
var user;
var task;

// Checking the body
router.use(function (req, res, next) {
  id = req.body.id;
  user = req.body.user;

  if (id == undefined || user == undefined) {
    // TODO Implement error here
    // Or throw or whatever, i dont know
    res.status(500).send('ERROR');
  } else {
    next();
  }

});

// get the task
router.use(function (req, res, next) {
  connection.query(query_get_task_by_id, id, function (err, rows, fields) {
    if (err) throw err;
    task = rows;
    next();
  })
});

router.post('/do', (req, res, next) => {
  connection.query(query_insert_history_task, [id, user], function (err, result) {
    if (err) throw err;
    res.send();
  });
});

module.exports = router;