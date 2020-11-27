const firebase = require('firebase-admin');
const functions = require('firebase-functions');

const express = require('express');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
const db = admin.initializeApp().database();





const app = express();

// These are demo endpints not for final release
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
//end of demo endpoints


//relates to user searching how much they can buy of each crypto from different exchanges
//with respect to their current budget
app.get('/api/offerings/asks/budget/:currency/:value', (req,res) => {
    //strating path for the database
    let databasePath = "TRADES/asks/" + req.params.currency;
    //empty output json object
    let jsonOutput = `{"offerings": []}`;
    //allows us to add smaller json objects to offerings array in output
    var output = JSON.parse(jsonOutput);
    //order children by price so we can compare with budget constraint
    db.ref(databasePath).on('value', (snapshot) => {
            let result = snapshot.val();
            
            //for each exchange offered
            for(exchange in result) {                       
                
                //for each crypto offered in the exchange
                for(crypto in result[exchange]) {
                    let budget = req.params.value;     
                    
                    let offerings = result[exchange][crypto];                    
                    let i = 0;
                    let amount = 0;

                    while(budget > 0) {
                        let offeringCost = parseFloat(offerings[i].price);
                        let offeringSize = parseFloat(offerings[i++].size);
                        if(budget < (offeringCost*offeringSize)) {
                            let ratio = budget / offeringCost;
                            budget -= offeringCost * offeringSize * ratio;
                            amount += offeringSize * ratio;

                        } else {
                            budget -= offeringCost * offeringSize;
                            amount += offeringSize;
                        }
                    }

                    output['offerings'].push(
                        { 
                            "Exchange": exchange, 
                            "CryptoCurrency" : crypto,
                            "Amount": amount,
                            "Currency": req.params.currency,
                            "Price" : req.params.value
                        });
                }                
               
            }
           res.json(output);

    })
})

app.get('/api/offerings/bids/budget/:cryptoCurrency/:amount', (req, res) => {
    //strating path for the database
    let databasePath = "TRADES/bids/";
    //empty output json object
    let jsonOutput = `{"offerings": []}`;
    //allows us to add smaller json objects to offerings array in output
    var output = JSON.parse(jsonOutput);
    //order children by price so we can compare with budget constraint
    db.ref(databasePath).on('value', (snapshot) => {
            let result = snapshot.val();
            for(currency in result) {
                for(exchange in result[currency]) {
                    let offerings = result[currency][exchange][req.params.cryptoCurrency];
                    let amount = req.params.amount;
                    let price = 0;
                    let i = 0;

                    while(amount > 0) {
                        let offeringCost = parseFloat(offerings[i].price);
                        let offeringSize = parseFloat(offerings[i++].size);

                        if(amount < offeringSize) {
                            let ratio = amount / offeringSize;
                            amount -= offeringSize;
                            price += (offeringCost * offeringSize) * ratio;
                        } else {
                            amount -= offeringSize;
                            price += offeringCost * offeringSize;
                        }
                    }

                    output['offerings'].push(
                        { 
                            "Exchange": exchange, 
                            "CryptoCurrency" : req.params.cryptoCurrency,
                            "Amount": req.params.amount,
                            "Currency": currency,
                            "Price" : price
                        });
                }
            }
            
           res.json(output);

    })
})



exports.RESTEndpoints = functions.https.onRequest(app);