var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto=require('crypto');
var bodyParser = require('body-parser');
var session=require('express-session');
var config = {
  
  user: 'divya063',
  database: 'divya063',
  host: 'db.imad.hasura-app.io',
  port:'5432',
   password: process.env.DB_PASSWORD
};





var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
function hash (input,salt){
    var hashed=crypto.pbkdf2Sync(input, salt, 100000, 512, 'sha512');
    return ["pbkdf2Sync","10000",salt, hashed.toString('hex')].join('$');
}
app.get('/hash/:input', function (req, res) {
  var hashedString = hash(req.params.input,'this-is-some-random-string');
  res.send(hashedString);
});
app.post('/create-user', function (req, res) {
    var username=req.body.username;
     var password=req.body.password;
    var salt=crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    pool.query('INSERT INTO "user" (username,password) VALUES($1,$2)',[username, dbString],function (err,result){
         if (err){
            res.status(500).send(err.toString());
        }else {
            res.send('User successfully created: '+ username);
        }
        
    });
});
app.post('/login', function (req, res) {
    var username=req.body.username;
     var password=req.body.password;
   
    pool.query('SELECT * FROM "user" WHERE username=$1',[username],function (err,result){
         if (err){
            res.status(500).send(err.toString());
        }else {
            if (result.rows.length===0){
                res.send(403).send('usename/password is invalid');
            }else {
                var dbString=result.rows[0].password;
               var salt=dbString.split('$')[2];
               var hashedPassword=hash(password,salt);
               if(hashedPassword===dbString){
                    req.session.auth = {userId: result.rows[0].id};
               res.send('credentials correct!'); 
               }else {
                    res.send(403).send('usename/password is invalid');
               
               }
            }
           
        }
        
    });
});

app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
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
app.get('/article', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article.html'));
});
app.get('/log',function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'log.html'));
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

app.get('/ui/profile.js',function (req,res){
    res.sendFile(path.join(__dirname, 'ui', 'profile.js'));
});
var names=[];
app.get('/submit-comment',function (req,res){
    var nam=req.query.comment;
    names.push(comment);
    res.send(JSON.stringify(names));
    
});
var counter=0;
app.get('/counter', function (req, res) {
    counter=counter+1;
  res.send(counter.toString());
});






var port = 8080; 
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
