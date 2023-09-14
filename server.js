// import node.js, mime, and other dependencies
const express = require('express'),
      app = express(),
      port = 3000

const appdata = [
  {id: 100000 , className: "CS 4241", assignmentName: "Assignment 2", dueDate:"2023-09-11", difficulty: 5, priority: "Medium"},
  {id: 200000 , className: "CS 3013", assignmentName: "Homework 1", dueDate:"2023-09-05", difficulty: 3, priority: "Low"}
];

// Send static files in public directory to Node.js server
app.use(express.static("public"));

app.get("/assignment-data", (request, response) => {
  response.writeHead(200, "OK", {'Content-Type': 'text/json'});
  response.end(JSON.stringify(appdata));
});

app.post("/submit", (request, response) => {
  let dataString = "";

  request.on("data", function(data) {
    dataString += data;
  });

  request.on("end", function() {
    let sentData = JSON.parse(dataString);
    let result = handleAssignmentData(sentData);
    response.writeHead(200, "OK", {'Content-Type': 'text/json'});
    response.end(result);
  });
});

app.put("/assignment-edit", (request, response) => {
    let dataString = "";

    request.on('data', function(data) {
      dataString += data;
    });

    request.on('end', function() {
      let editedData = JSON.parse(dataString);
      let found = false;

      appdata.forEach(assignment => {
        if(assignment.id === editedData.id && !found) {
          found = true;
          editedData.priority = calculatePriority(editedData.dueDate, editedData.difficulty);
          appdata[appdata.indexOf(assignment)] = editedData;
        }
      });
      const resultJSON = found ? JSON.stringify({result: "success", message: ""}) : JSON.stringify({result: "failure", message: `ID ${editedData.id} not found.`});
      response.writeHead(200, "OK", {'Content-Type': 'text/json'});
      response.end(resultJSON);
    });
});

app.delete("/assignment-delete", (request, response) => {
    let dataString = "";

    request.on('data', function(data) {
      dataString += data;
    });

    request.on('end', function() {
      let dataToDelete = JSON.parse(dataString);

      appdata.forEach(assignment => {
        if(JSON.stringify(dataToDelete) === JSON.stringify(assignment)) {
          appdata.splice(appdata.indexOf(assignment), 1);
          response.writeHead(200, "OK", {'Content-Type': 'text/json'});
          response.end(JSON.stringify({result: "success", message: ""}));
        }
      });
    });
});

app.listen(process.env.PORT || port) // set up server to listen on port 3000

const handleAssignmentData = function(sentData) {
  // verify data integrity, reject bad data
  let id = sentData.id;
  let className = sentData.className;
  let assignmentName = sentData.assignmentName;
  let dueDate = sentData.dueDate;
  let difficulty = sentData.difficulty;
  let difficultyNum = parseInt(difficulty);

  // send failure if any of the fields are empty
  if(className === "" || assignmentName === "" || dueDate === "") {
      return JSON.stringify({ result: "failure", message: "One or more fields are empty!" });
  } else if(difficulty === "" || isNaN(difficultyNum) || difficultyNum < 0 || difficultyNum > 10) {
      return JSON.stringify({ result: "failure", message:"Difficulty must be an integer between 1 and 10!" });
  } else {
      let priority = calculatePriority(dueDate, difficulty); // calculate derived field
      appdata.push(
          {id: id, className: className, assignmentName: assignmentName, dueDate: dueDate, difficulty: difficulty, priority: priority }
      );
      return JSON.stringify({ result: "success", message: ""});
  }
}

const calculatePriority = function (dueDate, difficulty) {
  let date = new Date(dueDate);

  if((difficulty > 0 && difficulty <= 3) || date.getDay() >= 14) {
      return "Low"
  } else if((difficulty > 3 && difficulty <= 6) || (date.getDay() >= 7 && date.getDay() < 14)) {
      return "Medium"
  } else {
      return "High"
  }
}