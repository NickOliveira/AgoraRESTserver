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





exports.RESTEndpoints = functions.https.onRequest(app);