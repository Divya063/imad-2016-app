var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto=require('crypto');
var config = {
  
  user: 'divya063',
  database: 'divya063',
  host: 'db.imad.hasura-app.io',
  port:'5432',
   password: process.env.DB_PASSWORD
};

var bodyParser = require('body-parser');



var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
function hash (input,salt){
    var hashed=crypto.pbkdf2Sync(input, salt, 100000, 512, 'sha512');
    return ["pbkdf2Sync","10000",salt, hashed.toString('hex')].join('$');
}
app.get('/hash/:input', function (req, res) {
  var hashedString = hash(req.params.input,'this-is-some-random-string');
  res.send(hashedString)
});
var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    pool.query('SELECT * FROM test', function(err,result){
        if (err){
            res.status(500).send(err.toString());
        }else {
            res.send(JSON.stringify(result.rows));
        }
        
    });
 
});
app.get('/co', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'co.html'));
});
app.get('/login',function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'login.html'));
});
app.get('/signup',function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'signup.html'));
});
app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js',function (req,res){
    res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});
var names=[];
app.get('/submit-name',function (req,res){
    var nam=req.query.nam;
    names.push(nam);
    res.send(JSON.stringify(names));
    
});
var counter=0;
app.get('/counter', function (req, res) {
    counter=counter+1;
  res.send(counter.toString());
});






var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
