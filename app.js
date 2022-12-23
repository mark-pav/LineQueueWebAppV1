//jshint esversion:8

const express = require('express');
var bodyParser = require('body-parser');
let ejs = require('ejs');
const { MongoClient } = require("mongodb");
require('dotenv').config();

//mongoBD stuff start
const uri = "mongodb+srv://markuser:" + process.env.dbPASSWORD + "@cluster0.igaswin.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const database = client.db('LineQueueBD1');
const currentLine = database.collection('currentLine');
//mongoBD stuff extended


//Date
var todayDate;
var todayTime;



const app = express();

let customerLine = [];
let adminLine = [];


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.get('/', async function(req, res){
  const cursor = currentLine.find({ workStatus: "Checked in" });
  customerLine = await cursor.toArray();
  console.log(customerLine.length);
  res.render('home', {currentLine: customerLine});
});

app.get("/dashboard", (req, res) => {
  res.render('password');
});

app.get("/passwordCheck", (req, res) => {
  console.log(req.query.password + " " + process.env.PASSWORD );
  if(req.query.password == process.env.PASSWORD) {
    res.render('adminDashboard', {currentLine: customerLine});
  } else {
    res.redirect("/");
  }
});

app.get('/add', function(req, res){
  res.render('add');
});

app.post('/add', function(req, res){
  getFreshDate();
  //getting values from form at /add to a local variable
  const lineInputRequestFromUser = {
    timeCheckedIn: todayTime,
    phoneNumber: req.body.phoneNumberInput,
    companyName: req.body.companyNameInput,
    description: req.body.descriptionInput,
    equipment: req.body.equipmentInput,
    workStatus: "Checked in"
  };



  async function insertToDB(userInput) {
      // test later if these lines moved to top of the file won't create any problems
      // const database = client.db('LineQueueBD1');
      // const currentLine = database.collection('currentLine');

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


      // Ensures that the client will close when you finish/error
      //client.close();

  }

  insertToDB(lineInputRequestFromUser);

});

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
