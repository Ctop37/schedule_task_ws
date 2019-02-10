var express = require('express');
var router = express.Router();
var connection = require('../database/mysql')

var query_get_groups = "SELECT * FROM todo_task.group g";
var query_get_tasks = "SELECT * FROM todo_task.task t";
var query_get_history = "SELECT * FROM todo_task.task_history h";
var query_get_group_by_id = "SELECT * FROM todo_task.group g WHERE g.id = %1";

var groups;
var tasks;
var history;

router.get('/lol', function(req, res, next) {
  res.send("lol");
});

router.use(function (req, res, next) {
  console.log("GET GROUPS");
  connection.query(query_get_groups, function (err, rows, fields) {
    if (err) throw err;
    groups = rows;
    next();
  })

});

router.use(function (req, res, next) {
  console.log("GET TASKS");
  connection.query(query_get_tasks, function (err, rows, fields) {
    if (err) throw err;
    tasks = rows;
    next();
  })

});

router.use(function (req, res, next) {
  console.log("GET HISTORY");
  connection.query(query_get_history, function (err, rows, fields) {
    if (err) throw err;
    history = rows;
    next();
  })

});

router.get('/', function(req, res, next) {    
   console.log("Groups");
   console.log(groups);
   console.log("Tasks");
   console.log(tasks);
   console.log("History");
   console.log(history);

    res.send("OK");
});


router.get('/mdr', function(req, res, next) {
  res.send("mdr");
});

module.exports = router;