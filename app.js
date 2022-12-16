//jshint esversion:6
const express = require('express');
var bodyParser = require('body-parser');
let ejs = require('ejs');

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




app.listen(3000, () => {
  console.log(`App listening on port 3000`);
});
