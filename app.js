var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')
const { response } = require('express')

app.use(bodyParser.urlencoded({extended:false}))

function getConnection() {
    return mysql.createConnection({
        host:'localhost',
        user: 'root',
        password: 'pass4root',
        database: 'finalproject'
    })
}

app
    .route('/')
    .get((req, res) => {
        res.sendFile('./LabLogin.html',{root: __dirname })
    })
    .post((req,res) => {
        labid = req.body.labid
        password = req.body.password
        getConnection().query(`SELECT * FROM finalproject WHERE labid = '${labid}' AND password = '${password}'`, (err,results) => {
            console.log(results)
            if (results.length > 0){
                res.redirect("/labhome")
                res.end()
            }
            else{
                res.sendFile('./LabLogin.html',{root: __dirname })
            }
        })
    })

app.get('/labhome', function(req, res) {
    res.sendFile('./LabHome.html',{root: __dirname })
});

app.get('/labhome/testcollection', function(req, res) {
    res.sendFile('./TestCollection.html',{root: __dirname })
});

app.get('/labhome/poolmapping', function(req, res) {
    res.sendFile('./PoolMapping.html',{root: __dirname })
});

app.get('/labhome/welltesting', function(req, res) {
    res.sendFile('./WellTesting.html',{root: __dirname })
});

app.get('/employee', function(req, res) {
    res.sendFile('./Employee.html',{root: __dirname })
});

app.get('/labtech', function(req, res) {
    res.sendFile('./index.html',{root: __dirname })
});

app.listen('3000', err =>{
    if (err) throw err
});
