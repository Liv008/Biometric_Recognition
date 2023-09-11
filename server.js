var express = require('express')
var bodyParser = require("body-parser")
var con = require("./database_setup")
const cookieParser = require("cookie-parser");
const sessions = require('express-session');


var id = "veryrandomsecretid";
var session;
const oneDay = 1000 * 60 * 60 * 24;
var values = []
var sql = ""

var app = express()

app
    .use(express.static(__dirname))
    .use(bodyParser.urlencoded({extended:false}))
    .use(bodyParser.json())
    .use(cookieParser())
    .use(sessions({
        secret: id,
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false
    }))
    .post('/app', (req,res) => {
        var id = Math.random().toString(16).slice(2)
        sql = "INSERT INTO users_data(UserID, Name, Email, Biometrics) VALUES (?);";
        values = [id, req.body.name, req.body.email, req.body.vid];
        con.query(sql,[values], (err, result) =>{
            if (err) throw err;
            session = id;
            session.userid = id;
            res.send('Hey there! Welcome ' + req.body.name + ' <a href=" /logout ">click to logout</a>' );
        })})
    .get('/ap', (req,res) => {
        sql = "SELECT * FROM users_data;"
        con.query(sql, (err, result) =>{
            if (err) throw err;
            res.json(result)
        })})
    .post('/welcome', (req, res) => {
        if (req.body.mat === 'unknown') {
            res.send('User not recognized.<a href="http://localhost:3000">Click to come back to main page</a>' );
        } else {
            id = req.body.mat
            sql = "SELECT UserID, Name FROM users_data WHERE UserID = ?;"
            con.query(sql, [id], (err, result) => {
                if (err) throw err;
                for (var b in result){
                    session = id;
                    session.userid = id;
                    res.send('Hey there! Welcome ' + result[b].Name + ' <a href=" /logout ">click to logout</a>' );
                }})}})
    .get('/',(req,res) => {
        session = req.session;
        if (session.userid) {
            res.send("Welcome User <a href='/logout'>click to logout</a>");
        } else {
            res.sendFile('/index.html',{root:__dirname})
        }})
    .get('/logout',(req,res) => {
        req.session.destroy();
        res.redirect('/');
    })
    .listen(3000, () => {console.log('Local server is listening on port 3000')})