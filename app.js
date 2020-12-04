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
        database: 'finalProject316'
    })
}

app.get('/', function(req, res){
    res.redirect('/labtech');
});

app
    .route('/labtech')
    .get((req, res) => {
        res.sendFile('./labtech.html',{root: __dirname })
    })
    .post((req,res) => {
        labid = req.body.labid
        password = req.body.password
        getConnection().query(`SELECT * FROM LabEmployee WHERE labID = '${labid}' AND password = '${password}'`, (err,results) => {
            if (err) throw err;
            if (results.length > 0){
                res.redirect("/labtech/labhome")
                res.end()
            }
            else{
                res.sendFile('./labtech.html',{root: __dirname })
            }
        })
    })

app.get('/labtech/labhome', function(req, res) {
    res.sendFile('./LabHome.html',{root: __dirname })
});

app
    .route("/labtech/labhome/testcollection")
    .get((req,res) => {
        res.sendFile('./TestCollection.html',{root: __dirname })
    })
    .post((req,res) => {
        action = req.body.event
        empid = req.body.empid
        barcode = req.body.barcode
        if (action == "Add"){
            if (empid == "" || barcode == ""){
                getConnection().query(`SELECT employeeID, testBarcode FROM employeetest`, (err,results) =>{
                    if (err) throw err;
                    res.json(results)
                })
            }
            else{
                getConnection().query(`SELECT * FROM employeetest WHERE employeeID = '${empid}' AND testBarcode = '${barcode}'`, (err,results) => {
                    if (err) throw err;
                    if (results.length == 0){
                        getConnection().query(`INSERT INTO employeetest (employeeID,testBarcode) VALUES (${empid},${barcode})`, (err,results1) =>{
                            if (err) throw err
                            getConnection().query(`SELECT employeeID, testBarcode FROM employeetest`, (err,results) =>{
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
                getConnection().query(`SELECT * FROM employeetest LIMIT ${checkedValues[i]},1`, (err,results) =>{
                    console.log(results)
                    if (err) throw err
                    getConnection().query(`DELETE FROM employeetest WHERE employeeID = ${results[0].employeeID} AND testBarcode = ${results[0].testBarcode}`, (err,results1 =>{
                        if (err) throw err;
                        getConnection().query(`SELECT employeeID, testBarcode FROM employeetest`, (err,results2) =>{
                            if (err) throw err;
                        })
                    }))
                })
            }
            res.json(resultsStore)            
        }
    })

app
    .route('/labtech/labhome/poolmapping')
    .get((req, res) => {
        res.sendFile('./PoolMapping.html',{root: __dirname })
    })
    .post((req,res) =>{
        barcodes = req.body.barcodes
        poolBarcode = req.body.poolBarcode
        action = req.body.action
        if (action == "Submit Pool"){
            if (poolBarcode == ""){
                getConnection().query(`SELECT poolBarcode, testBarcode FROM poolmap`, (err,results) =>{
                    if (err) throw err;
                    res.json(results)
                })
            }
            else{
                getConnection().query(`SELECT * FROM Pool WHERE poolBarcode = '${poolBarcode}'`, (err,results) => {
                    if (err) throw err;
                    if (results.length == 0){
                        getConnection().query(`INSERT INTO Pool (poolBarcode) VALUES (${poolBarcode})`, (err,results1) => {
                            console.log(barcodes)
                            if (err) throw err;
                            for (var i = 0; i < barcodes.length; i++){
                                if (barcodes[i]){
                                    getConnection().query(`INSERT INTO poolmap (testBarcode,poolBarcode) VALUES (${barcodes[i]},${poolBarcode})`, (err,results1) =>{
                                        if (err) throw err
                                    })        
                                }  
                            }   
                            getConnection().query(`SELECT empid, barcode FROM finalproject`, (err,results) =>{
                                if (err) throw err;
                                res.json(results)
                            })          
                        })
                    }
                })
            }
        }
        if (action == "Edit Pool"){

        }
    })


app.get('/labtech/labhome/welltesting', function(req, res) {
    res.sendFile('./WellTesting.html',{root: __dirname })
});

app.get('/employee', function(req, res) {
    res.sendFile('./EmployeeLogin.html',{root: __dirname })
});

app.listen('3000', err =>{
    if (err) throw err
});
