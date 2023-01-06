//jshint esversion:8

const express = require('express');
var bodyParser = require('body-parser');
let ejs = require('ejs');
const { MongoClient } = require("mongodb");
require('dotenv').config();
var mongoose = require('mongoose');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//mongoBD stuff start
const uri = "mongodb+srv://markuser:" + process.env.dbPASSWORD + "@cluster0.igaswin.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);


const database = client.db('LineQueueBD1');
const currentLine = database.collection('currentLine');
//mongoBD stuff extended


//Date
var todayDate;
var todayTime;





let customerLine = [];
let adminLine = [];






app.get('/', async function(req, res){
  getFreshDate();
  const cursor = currentLine.find({ workStatus: "Checked in", dateCheckedIn: todayDate });
  customerLine = await cursor.toArray();

  res.render('home', {currentLine: customerLine, date: todayDate});
});

app.get("/dashboard", (req, res) => {
  res.render('password');
});

//adminDashboard
app.get("/passwordCheck", async(req, res) => {

  if(req.query.password == process.env.PASSWORD) {
    getFreshDate();
    const cursor = currentLine.find({dateCheckedIn: todayDate});
    adminLine = await cursor.toArray();

    res.render('adminDashboard', {currentLine: adminLine, date: todayDate});


  } else {
    res.redirect("/");
  }
});

//update work status
app.post('/adminDashboard', async function(req, res){
  let workStatusForUpdate = req.body.statusSelected;
  let idForUpdateString = req.body.id;
  var objectId = mongoose.Types.ObjectId(idForUpdateString);

  async function update(id, workstatus) {
    // create a filter for a movie to update
    const filter = { _id: id };
    // this option instructs the method to create a document if no documents match the filter
    //const options = { upsert: false };
    // create a document that sets the plot of the movie
    const updateDoc = {
      $set: {
        workStatus: workstatus
      },
    };
    const result = await currentLine.updateOne(filter, updateDoc, function(error, result){
      if(error){
        console.log(error);
        alert("Looks like something went wrong while updating you to the line. Please, try again.");
      }
      if(result){
        console.log(
          `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        );

        res.redirect("/passwordCheck?password=" + process.env.PASSWORD);
      }
    });


  }
  update(objectId, workStatusForUpdate);


});

app.post('/delete', async function(req, res){
  let idForUpdateString = req.body.id;
  var objectId = mongoose.Types.ObjectId(idForUpdateString);

  async function deleteLineEntry(id) {
    // create a filter for a movie to update
    const filter = { _id: id };
    const result = await currentLine.deleteOne(filter, function(error, result){
      if(error){
        console.log(error);
        alert("Looks like something went wrong while deleting this line entry. Please, try again.");
      }
      if(result){
        console.log(
          `${result.matchedCount} document(s) matched the filter, deleted ${result.modifiedCount} document(s)`,
        );

        res.redirect("/passwordCheck?password=" + process.env.PASSWORD);
      }
    });


  }
  deleteLineEntry(objectId);

});

app.get('/add', function(req, res){
  res.render('add');
});

app.post('/add', function(req, res){
  getFreshDate();
  //getting values from form at /add to a local variable
  const lineInputRequestFromUser = {
    dateCheckedIn: todayDate,
    timeCheckedIn: todayTime,
    phoneNumber: req.body.phoneNumberInput,
    companyName: req.body.companyNameInput,
    description: req.body.descriptionInput,
    equipment: req.body.equipmentInput,
    workStatus: "Pending"
  };



  async function insertToDB(userInput) {

      const result = await currentLine.insertOne(userInput, function(error, result){
        if(error){
          console.log(error);
          alert("Looks like something went wrong while adding you to the line. Please, try again.");
        }
        if(result){
          console.log(
           `A document was inserted with the _id: ${result.insertedId}`
          );
            res.render("thankYou");
        }
      });


  }

  insertToDB(lineInputRequestFromUser);

});

app.get('/addAdmin', function(req, res){
  res.render('addAdmin');
});

app.post('/addAdmin', function(req, res){
  getFreshDate();
  //getting values from form at /add to a local variable
  const lineInputRequestFromUser = {
    dateCheckedIn: todayDate,
    timeCheckedIn: todayTime,
    phoneNumber: req.body.phoneNumberInput,
    companyName: req.body.companyNameInput,
    description: req.body.descriptionInput,
    equipment: req.body.equipmentInput,
    workStatus: req.body.workStatusInput
  };



  async function insertToDB(userInput) {

      const result = await currentLine.insertOne(userInput, function(error, result){
        if(error){
          console.log(error);
          alert("Looks like something went wrong while adding you to the line. Please, try again.");
        }
        if(result){
          console.log(
           `A document was inserted with the _id: ${result.insertedId}`
          );
            res.redirect("/passwordCheck?password=" + process.env.PASSWORD);
        }
      });


  }

  insertToDB(lineInputRequestFromUser);

});

async function getCurrentAdminCustomerList(){
  const cursor = currentLine.find({});
  adminLine = await cursor.toArray();
}

function getFreshDate(){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var ampm = "am";
  var hours = today.getHours();
  if(hours>12){
    hours-=12;
    ampm = "pm";
  }else{
    ampm = "am";
  }
  var minutes = String(today.getMinutes()).padStart(2, '0');

  todayDate = mm + '/' + dd + '/' + yyyy;
  todayTime = hours + ":" + minutes + " " + ampm;
}

app.listen(3000, () => {
  console.log(`App listening on port 3000`);
});
