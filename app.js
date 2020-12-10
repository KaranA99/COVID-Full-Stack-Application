var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')
const moment = require('moment')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());


function getConnection() {
    return mysql.createConnection({
        host:'localhost',
        user: 'root',
        password: 'pass4root',
        database: 'finalproject316'
    })
}


app.get('/', function(req, res){
    res.redirect('/labtech');
});

var labid_global;

app
    .route('/labtech')
    .get((req, res) => {
        res.sendFile('./labtech.html',{root: __dirname })
    })
    .post((req,res) => {
        labid = req.body.labid
        labid_global = labid
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
                getConnection().query(`SELECT employeeID, testBarcode FROM employeetest WHERE collectedBy = ${labid_global}`, (err,results) =>{
                    if (err) throw err;
                    res.json(results)
                })
            }
            else{
                getConnection().query(`SELECT * FROM employeetest WHERE employeeID = '${empid}' AND testBarcode = '${barcode}' AND collectedBy = ${labid_global}`, (err,results) => {
                    if (err) throw err;
                    if (results.length == 0){
                        var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                        getConnection().query(`INSERT INTO employeetest (employeeID,testBarcode,collectionTime,collectedBy) VALUES ('${empid}','${barcode}','${mysqlTimestamp}','${labid_global}')`, (err,results1) =>{
                            if (err) throw err
                            getConnection().query(`SELECT employeeID, testBarcode FROM employeetest WHERE collectedBy = ${labid_global}`, (err,results) =>{
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
            for (var i = 0; i < checkedValues.length; i++){
                getConnection().query(`SELECT * FROM employeetest WHERE collectedBy = ${labid_global} LIMIT ${checkedValues[i]},1`, (err,results) =>{
                    if (err) throw err
                    getConnection().query(`DELETE FROM employeetest WHERE employeeID = ${results[0].employeeID} AND testBarcode = ${results[0].testBarcode} AND collectedBy = ${labid_global}`, (err,results1 =>{
                        if (err) throw err;
                        getConnection().query(`SELECT employeeID, testBarcode FROM employeetest`, (err,results2) =>{
                            if (err) throw err;
                        })
                    }))
                })
            }
            res.json([])            
        }
    })

app
    .route('/labtech/labhome/poolmapping')
    .get((req, res) => {
        res.sendFile('./PoolMapping.html',{root: __dirname })
    })
    .post((req,res) => {
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
                getConnection().query(`SELECT * FROM pool WHERE poolBarcode = '${poolBarcode}'`, (err,results) => {
                    if (err) throw err;
                    if (results.length == 0){
                        getConnection().query(`INSERT INTO Pool (poolBarcode) VALUES ('${poolBarcode}')`, (err,results1) => {
                            if (err) throw err;
                            for (var i = 0; i < barcodes.length; i++){
                                if (i == barcodes.length - 1){
                                    getConnection().query(`INSERT INTO poolmap (testBarcode,poolBarcode) VALUES (${barcodes[i]},${poolBarcode})`, (err,results2) =>{
                                        if (err) throw err
                                        getConnection().query(`SELECT poolBarcode, testBarcode FROM poolmap`, (err,results) =>{
                                            if (err) throw err
                                            res.json(results)
                                        })  
                                    })
                                }
                                else{
                                    getConnection().query(`INSERT INTO poolmap (testBarcode,poolBarcode) VALUES (${barcodes[i]},${poolBarcode})`, (err,results2) =>{
                                        if (err) throw err
                                    })        
                                }
                            }   
                        })
                    }
                })
            }
        }
        if (action == "Show"){
            getConnection().query(`SELECT poolBarcode, testBarcode FROM poolmap`, (err,results) =>{
                if (err) throw err;
                res.json(results)
            })   
        }
        if (action == "Delete Pool"){
            counter = req.body.counter
            getConnection().query(`SELECT * FROM poolmap LIMIT ${counter},1`, (err,results) =>{
                if (err) throw err
                getConnection().query(`DELETE FROM poolmap WHERE testBarcode = ${results[0].testBarcode} AND poolBarcode = ${results[0].poolBarcode}`, (err,results1 =>{
                    if (err) throw err;
                    getConnection().query(`DELETE FROM pool WHERE poolBarcode = ${results[0].poolBarcode}`, (err,results2 =>{
                        if (err) throw err;
                        getConnection().query(`SELECT poolBarcode, testBarcode FROM poolmap`, (err,results3) =>{
                            if (err) throw err;
                            res.json([])
                        })
                    }))
                }))
            })
        }
    })


app
    .route('/labtech/labhome/welltesting')
    .get((req, res) =>{
        res.sendFile('./WellTesting.html',{root: __dirname })
    })
    .post((req,res) =>{
        action = req.body.action
        wellBarcode = req.body.wellBarcode
        poolBarcode = req.body.poolBarcode
        result = req.body.result
        if (action == "Add"){
            if (wellBarcode == "" || poolBarcode == ""){
                getConnection().query(`SELECT poolBarcode, wellBarcode, result FROM welltesting`, (err,results) =>{
                    if (err) throw err;
                    res.json(results)
                })
            }
            else{
                getConnection().query(`SELECT * FROM well WHERE wellbarcode = '${wellBarcode}'`, (err,results) => {
                    if (err) throw err;
                    if (results.length == 0){
                        getConnection().query(`INSERT INTO well (wellBarcode) VALUES ('${wellBarcode}')`, (err,results) =>{
                            var testingStartTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                            getConnection().query(`INSERT INTO wellTesting (poolBarcode,wellBarcode,testingStartTime,result) VALUES ('${poolBarcode}','${wellBarcode}','${testingStartTime}','${result}')`, (err,results1) =>{
                                if (err) throw err
                                getConnection().query(`SELECT poolBarcode, wellBarcode, result FROM welltesting`, (err,results) =>{
                                    if (err) throw err;
                                    res.json(results)
                                })
                            })       
                        })                 
                    }
                })
            }
        }
        if (action == "Delete"){
            checkedValues = req.body.array
            for (var i = 0; i < checkedValues.length; i++){
                getConnection().query(`SELECT * FROM welltesting LIMIT ${checkedValues[i]},1`, (err,results) =>{
                    if (err) throw err
                    getConnection().query(`DELETE FROM welltesting WHERE poolBarcode = ${results[0].poolBarcode} AND wellBarcode = ${results[0].wellBarcode}`, (err,results1 =>{
                        if (err) throw err;
                        getConnection().query(`DELETE FROM well WHERE wellBarcode = ${results[0].wellBarcode}`, (err,results2 =>{
                            if (err) throw err;
                        }))
                    }))
                })
            }
            console.log(1)
            res.json([])
        }
    }) 

app
    .route('/employee')
    .get((req, res) => {
        res.sendFile('./EmployeeLogin.html',{root: __dirname })
    })
    .post((req,res) => {
        email = req.body.email
        password = req.body.password
        res.sendFile('./EmployeeLogin.html',{root: __dirname })
        getConnection().query(`SELECT * FROM Employee WHERE email = '${email}' AND passcode = '${password}'`, (err,results) => {
            if (err) throw err;
            if (results.length > 0){
                res.redirect("/employee")
                res.end()
            }
            else{
                res.sendFile('./labtech.html',{root: __dirname })
            }
        })
    })

app.listen('3000', err =>{
    if (err) throw err
});
