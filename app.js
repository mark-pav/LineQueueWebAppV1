//jshint esversion:8

const express = require('express');
var bodyParser = require('body-parser');
let ejs = require('ejs');
const { MongoClient } = require("mongodb");


const uri = "mongodb+srv://markuser:<password>@cluster0.igaswin.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const database = client.db('LineQueueBD1');
const currentLine = database.collection('currentLine');



const app = express();

let line = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.get('/', async function(req, res){
  const cursor = currentLine.find();
  line = await cursor.toArray();

  res.render('home', {currentLine: line});
});

app.get('/add', function(req, res){
  res.render('add');
});

app.post('/add', function(req, res){

  //getting values from form at /add to a local variable
  const lineInputRequestFromUser = {
    phoneNumber: req.body.phoneNumberInput,
    companyName: req.body.companyNameInput,
    description: req.body.descriptionInput,
    equipment: req.body.equipmentInput
  };
  //pushing it to the local variable line array for displaying on the home page (will change to retreive from db later)
  line.push(lineInputRequestFromUser);

  async function insertToDB(userInput) {

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



app.listen(3000, () => {
  console.log(`App listening on port 3000`);
});
