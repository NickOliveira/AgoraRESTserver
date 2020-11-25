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
                        let offeringSize = parseFloat(offerings[i].size);
                        if(budget < offeringCost) {
                            let ratio = budget / offeringCost;
                            budget -= offeringCost;
                            amount += offeringSize * ratio;

                        } else {
                            budget -= offeringCost;
                            amount += offeringSize;
                        }
                    }

                    output['offerings'].push(
                        { 
                            "name": exchange, 
                            "crypto" : crypto,
                            "amount": amount,
                            "currency": req.params.currency,
                            "price" : req.params.value
                        });
                }                
               
            }
           res.json(output);

    })
})



exports.RESTEndpoints = functions.https.onRequest(app);