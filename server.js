var express = require('express');
require('dotenv').config();
const mongodbConnectionString = process.env.CONNSTRING;
var app = express();
var port = process.env.PORT || 8080;

// cors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// mongoose config
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect(mongodbConnectionString);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: cannot connect to my distant DB :('));
db.once('open', function () {
    console.log('connected to the distant DB :)');
});

// body parser config
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// creating a techno mongoose model
const technoSchema = mongoose.Schema({
    name: String,
    details: String,
    dateStudy: Date,
    dateCreation: Date,
    timeSpentStudying: String,
    isPrioritary: Boolean
});
const Techno = mongoose.model('Techno', technoSchema);


// routes
app.get('/', (req, res) => {
    res.send(`Hello Node Test API à ${new Date().toISOString()}`);
});

app.get('/technos', (req, res) => {
    Techno.find((err, technos) => {
        if (err) {
            console.log('could not retrieve technos from DB');
            res.json({});
        } else {
            res.json(technos);
        }
    });
});

app.get('/techno/:technoid', (req, res) => {
    const technoId = req.params.technoid;
    Techno.findById(technoId, (err, techno)=>{
        if(err) {
            return res.status(404).json({ error: true, message: 'techno non trouvée'});
        }        
        return res.status(200).json(techno);
    });
}); 

app.get('/techno/:technoid/toggle_priority', (req, res) => {
    const technoId = req.params.technoid;
    Techno.findById(technoId, (err, techno)=>{
        if(err) {
            return res.status(404).send({ error: true, message: 'techno non trouvée'});
        }
        console.log('techno.isPrioritary', techno.isPrioritary);
        techno.isPrioritary = !techno.isPrioritary;
        techno.save();
        return res.status(200).send({error: false, message: `techno ${techno._id} prioritaire est ${techno.isPrioritary}`});
    });
}); 

app.post('/technos', (req, res) => {

    if (!req.body) {
        return res.sendStatus(500);
    } else {
        let name = req.body.name;
        let details = req.body.details;
        let dateStudy = req.body.datestudy;
        let dateCreation =  req.body.datecreation;        
        let timeSpentStudying = req.body.timespentstudying;
        let isPrioritary = req.body.isprioritary;

        const myTechno = new Techno({ name, details, dateStudy, dateCreation, timeSpentStudying, isPrioritary });

        myTechno.save((err, savedTechno) => {
            if (err) {
                console.error(err);
                return;
            } else {
                console.log(savedTechno);
            }
        });

        res.sendStatus(201);
    }
});

// listening
app.listen(port);
console.log('Server started! At http://localhost:' + port);