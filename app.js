//jshint esversion:6
const express = require('express');
var bodyParser = require('body-parser');
let ejs = require('ejs');
const { MongoClient } = require("mongodb");


const uri = "mongodb+srv://markuser:<password>@cluster0.igaswin.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const app = express();

const line = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/add', function(req, res){
  res.render('add');
});


async function run() {
  try {
    const database = client.db('LineQueueBD1');
    const currentLine = database.collection('currentLine');

    // Query for a movie that has the title 'Back to the Future'
    const doc = { phoneNumber: "253 123 1234", companyName: "best company", description: "8 drive tires" };
    const result = await currentLine.insertOne(doc);
    console.log(
     `A document was inserted with the _id: ${result.insertedId}`
  );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.listen(3000, () => {
  console.log(`App listening on port 3000`);
});
