var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());


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
            if (err) throw err;
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

app
    .route("/labhome/testcollection")
    .get((req,res) => {
        res.sendFile('./TestCollection.html',{root: __dirname })
    })
    .post((req,res) => {
        action = req.body.event
        empid = req.body.empid
        barcode = req.body.barcode
        if (action == "Add"){
            if (empid == "" || barcode == ""){
                getConnection().query(`SELECT empid, barcode FROM finalproject`, (err,results) =>{
                    if (err) throw err;
                    res.json(results)
                })
            }
            else{
                getConnection().query(`SELECT * FROM finalproject WHERE empid = '${empid}' AND password = '${barcode}'`, (err,results) => {
                    if (err) throw err;
                    if (results.length == 0){
                        getConnection().query(`INSERT INTO finalproject (empid,barcode) VALUES (${empid},${barcode})`, (err,results1) =>{
                            if (err) throw err
                            getConnection().query(`SELECT empid, barcode FROM finalproject`, (err,results) =>{
                                if (err) throw err;
                                res.json(results)
                            })
                        })                        
                    }
                })
            }
            
        }
        if (action == "Delete"){
            checkedValues = req.body.array
            var resultsStore = [];
            for (var i = 0; i < checkedValues.length; i++){
                getConnection().query(`SELECT * FROM finalproject LIMIT ${checkedValues[i]},1`, (err,results) =>{
                    if (err) throw err
                    getConnection().query(`DELETE FROM finalproject WHERE empid = ${results[0].empid} AND barcode = ${results[0].barcode}`, (err,results1 =>{
                        if (err) throw err;
                        getConnection().query(`SELECT empid, barcode FROM finalproject`, (err,results2) =>{
                            if (err) throw err;
                        })
                    }))
                })
            }
            res.json(resultsStore)            
        }
    })

app
    .route('/labhome/poolmapping')
    .get((req, res) => {
        res.sendFile('./PoolMapping.html',{root: __dirname })
    })
    .post((req,res) =>{
        
    })


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
