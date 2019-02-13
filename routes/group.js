var express = require('express');
var router = express.Router();
var connection = require('../database/mysql')

var query_get_groups = "SELECT * FROM todo_task.group g ORDER BY g.id asc";
var query_get_tasks = "SELECT * FROM todo_task.task t ORDER BY t.id asc";
var query_get_history = "SELECT * FROM todo_task.task_history h ORDER BY h.date desc";
var query_get_group_by_id = "SELECT * FROM todo_task.group g WHERE g.id = %1";

var groups;
var tasks;
var history;

const freqSplit = '/';
const occurSplit = '-';

/**
 * Get an array containing the frequencies we want to compare to
 * 
 * @param {*} obj Group or Task
 * 
 * @return Array containing the freqs
 */
function getFreqs(obj) {
  var freqs = obj.freq.split(freqSplit);
  // We parse the frequencies from the String
  // Model is : X-X-X/X-X-X/X-X-X
  // '/' separate each frequency
  // '-' separate hour-day-month
  // X is an int
  freqs.forEach(function (freq, index) {
    var hourArray = freq.split(occurSplit);
    // Counting the hours
    // Not ideal, we need to take the month into account
    this[index] = parseInt(hourArray[0]) + parseInt(24 * hourArray[1]) + parseInt(24 * 30 * hourArray[2]);
  }, freqs);
  return freqs;
}

/**
 * Getting the history of a group
 * 
 * @param {*} group 
 * 
 * @return The history of the group
 */
function getGroupHist(group) {
  // Not really scalable for now
  // We need to take the "occur" into account here
  var array = [];
  // We create an array of id from the task of the group
  if (group.tasks != undefined) {
    group.tasks.forEach(task => {
      array.push(task.id);
    });
  }
  // We filter history based on this array
  return history.filter(h => array.includes(h.id));
}

/**
 * Getting the history of a task
 * 
 * @param {*} task 
 * 
 * @return The history of the task
 */
function getTaskHist(task) {
  // We filter history based on task id
  return history.filter(h => h.id_task === task.id);
}

/**
 * Calculate the criticity of an object based on history
 * 
 * @param {*} obj Task or Group
 * @param {*} hist History
 */
function calcCrit(obj, hist) {
  var freqs = getFreqs(obj);
  var criticity = freqs.length + 1;
  var today = new Date();

  // We take the "occur" most recent history
  // We compare it to our frequencies
  // If we have no history, criticity go to the max
  for (i = 0; i < obj.occur; i++) {
    if (hist[i] == undefined) {
      // If we have less history than the occur, we set up the max crit
      criticity = freqs.length + 1;
      break;
    }
    var comparedHours = Math.abs(today - hist[i].date) / 36e5;

    var currentCrit = 0;
    for (j = 0; j < freqs.length; j++) {
      if (comparedHours < freqs[j]) {
        // If we are ok at this frequency, we set this criticity
        // Next loop will set up equal or worse criticity
        currentCrit = j + 1;
        break;
      } else {
        // Else it is out of bound, so max criticity
        currentCrit = freqs.length + 1;
      }
      // We loop to an older history, where we calculate an equal or worse criticity.
    }
    criticity = currentCrit;
  }
  return criticity;
}

/**
 * Calculate criticity for a task
 * 
 * @param {*} task 
 * 
 * @return Integer
 */
function calcTaskCrit(task) {
  var taskHist = getTaskHist(task);
  return calcCrit(task, taskHist);
}

/**
 * Calculate criticity for a group
 * 
 * @param {*} group 
 * 
 * @return Integer
 */
function calcGroupCrit(group) {
  var groupHist = getGroupHist(group);
  return calcCrit(group, groupHist);
}

router.use(function (req, res, next) {
  connection.query(query_get_groups, function (err, rows, fields) {
    if (err) throw err;
    groups = rows;
    next();
  })

});

router.use(function (req, res, next) {
  connection.query(query_get_tasks, function (err, rows, fields) {
    if (err) throw err;
    tasks = rows;
    next();
  })

});

router.use(function (req, res, next) {
  connection.query(query_get_history, function (err, rows, fields) {
    if (err) throw err;
    history = rows;
    next();
  })

});

router.get('/', function (req, res, next) {
  result = JSON.parse(JSON.stringify(groups));

  // Loop through all tasks
  // Calculate task criticity
  // Add task to its group
  // TODO optimize the task array management
  tasks.forEach(task => {
    t = JSON.parse(JSON.stringify(task));
    t.criticity = calcTaskCrit(t);
    if (result.find(obj => {
        // If array already set, we push
        return obj.id === t.id_group
      }).tasks != undefined) {
      result.find(obj => {
        return obj.id === t.id_group
      }).tasks.push(t);
    } else {
      // Else we create the array and push
      result.find(obj => {
        return obj.id === t.id_group
      }).tasks = [];
      result.find(obj => {
        return obj.id === t.id_group
      }).tasks.push(t);
    }
  });

  result.forEach(group => {
    group.criticity = calcGroupCrit(group);
  })


  //console.log("Result");
  //console.log(result);

  res.send(result);
});

module.exports = router;