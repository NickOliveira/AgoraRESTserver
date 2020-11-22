const firebase = require('firebase-admin');
const functions = require('firebase-functions');

const express = require('express');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const db = admin.initializeApp().database();





const app = express();


app.get('/api/offerings' , (req, res) => {
    db.ref("TRADES/").on('value' , (snapshot) => {
        res.json(snapshot.val());
    });
});

app.get('/api/offerings/bids' , (req, res) => {
    db.ref("TRADES/bids").on('value' , (snapshot) => {
        res.json(snapshot.val());
    });
});

app.get('/api/offerings/asks' , (req, res) => {
    db.ref("TRADES/asks").on('value' , (snapshot) => {
        res.json(snapshot.val());
    });
});

app.get('/api/offerings/asks/:currency', (req, res) => {
    let databasePath = "TRADES/asks/" + req.params.currency;
    db.ref(databasePath).on('value', (snapshot) => {
       res.json(snapshot.val());
    })
})

app.get('/api/offerings/bids/:currency', (req, res) => {
    let databasePath = "TRADES/bids/" + req.params.currency;
    db.ref(databasePath).on('value', (snapshot) => {
       res.json(snapshot.val());
    })
})

app.get('/api/offerings/asks/:currency/:minMax/:Value', (req,res) => {
    if(req.params.minMax != "min" && req.params.minMax != "max") {
        res.json("{}");
    }
})




exports.RESTEndpoints = functions.https.onRequest(app);