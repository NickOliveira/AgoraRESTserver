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
app.get('/api/offerings/asks/budget/:currency/:amount', (req,res) => {
    //strating path for the database
    const databasePath = "TRADES/asks/" + req.params.currency;
    //empty output json object
    let jsonOutput = `{"offerings": []}`;
    //allows us to add smaller json objects to offerings array in output
    let output = JSON.parse(jsonOutput);
    //order children by price so we can compare with budget constraint
    db.ref(databasePath).on('value', (snapshot) => {
            let result = snapshot.val();
            
            //for each exchange offered
            for(exchange in result) {                       
                
                //for each crypto offered in the exchange
                for(crypto in result[exchange]) {
                    let budget = req.params.amount;  
                    //console.log(budget); 
                    
                    const offerings = result[exchange][crypto];                               
                    let i = 0;
                    let amount = 0;

                    while(budget > 0) {
                        const offeringCost = parseFloat(offerings[i].price);
                        const offeringSize = parseFloat(offerings[i++].size);

                        //console.log(offeringCost + " X " + offeringSize);
                        
                        //if we need to take a fraction of the offering
                        console.log("Cost for " + exchange + " at " + crypto + ":" + (offeringCost*offeringSize));
                        if(budget < (offeringCost*offeringSize)) {
                            let ratio = budget / offeringCost;
                            //console.log("ratio: " + ratio)
                            budget -= (offeringCost * offeringSize) * ratio;
                            amount += ratio;

                        } else {
                            budget -= (offeringCost * offeringSize);
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

app.get('/api/offerings/bids/budget/:currency/:amount', (req, res) => {
  //strating path for the database
  const databasePath = "TRADES/bids/" + req.params.currency;
  //empty output json object
  let jsonOutput = `{"offerings": []}`;
  //allows us to add smaller json objects to offerings array in output
  let output = JSON.parse(jsonOutput);
  //order children by price so we can compare with budget constraint
  db.ref(databasePath).on('value', (snapshot) => {
          let result = snapshot.val();
          
          //for each exchange offered
          for(exchange in result) {                       
              
              //for each crypto offered in the exchange
              for(crypto in result[exchange]) {
                  let budget = req.params.amount;  
                  //console.log(budget); 
                  
                  const offerings = result[exchange][crypto];                               
                  let i = 0;
                  let amount = 0;

                  while(budget > 0) {
                      const offeringCost = parseFloat(offerings[i].price);
                      const offeringSize = parseFloat(offerings[i++].size);

                      //console.log(offeringCost + " X " + offeringSize);
                      
                      //if we need to take a fraction of the offering
                      //console.log("Cost for " + exchange + " at " + crypto + ":" + (offeringCost*offeringSize));
                      if(budget < (offeringCost*offeringSize)) {
                          let ratio = budget / offeringCost;
                          //console.log("ratio: " + ratio)
                          budget -= (offeringCost * offeringSize) * ratio;
                          amount += ratio;

                      } else {
                          budget -= (offeringCost * offeringSize);
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


app.get("/api/offerings/asks/pair/:cryptoCurrency/:currency/:amount", (req, res) => {

    //strating path for the database
    const databasePath = "TRADES/asks/" + req.params.currency;
    //empty output json object
    let jsonOutput = `{"offerings": []}`;
    //allows us to add smaller json objects to offerings array in output
    let output = JSON.parse(jsonOutput);
    //order children by price so we can compare with budget constraint
    db.ref(databasePath).on('value', (snapshot) => {
            let result = snapshot.val();
            
            //for each exchange offered
            for(exchange in result) {                       
                
                let amount = req.params.amount;  
                //console.log(budget); 
                
                const offerings = result[exchange][req.params.cryptoCurrency];                               
                let i = 0;
                let cost = 0;
                //console.log(offerings[0])
                while(amount > 0) {
                    let offering = offerings[i++];                    
                    const offeringCost = parseFloat(offering.price);
                    const offeringSize = parseFloat(offering.size);
  
                    //console.log(offeringCost + " X " + offeringSize);
                    
                    //if we need to take a fraction of the offering
                    //console.log("Cost for " + exchange + " at " + crypto + ":" + (offeringCost*offeringSize));
                    if(amount < offeringSize) {
                        let ratio = amount / offeringSize;
                        cost += offeringCost * amount;
                        amount = 0;                         
                    } else {
                        amount -= offeringSize;
                        cost += offeringCost*offeringSize;
                    }
                } 
  
                output['offerings'].push(
                    { 
                        "Exchange": exchange, 
                        "CryptoCurrency" : req.params.cryptoCurrency,
                        "Amount": req.params.amount,
                        "Currency": req.params.currency,
                        "Price" : cost
                    });         
               
            }
           res.json(output);
    })
})

app.get('/api/offerings/bids/pair/:cryptoCurrency/:currency/:amount', (req, res) => {
    let databasePath = "TRADES/bids/" + req.params.currency;
    
    let jsonOutput = `{"offerings": []}`;
    //allows us to add smaller json objects to offerings array in output
    let output = JSON.parse(jsonOutput);
    //order children by price so we can compare with budget constraint
    db.ref(databasePath).on('value', (snapshot) => {
            let result = snapshot.val();
          
            //for each exchange offered
            for(exchange in result) {                       
                
                let amount = req.params.amount;  
                //console.log(budget); 
                
                const offerings = result[exchange][req.params.cryptoCurrency];                               
                let i = 0;
                let cost = 0;
                //console.log(offerings[0])
                while(amount > 0) {
                    let offering = offerings[i++];                    
                    const offeringCost = parseFloat(offering.price);
                    const offeringSize = parseFloat(offering.size);
  
                    //console.log(offeringCost + " X " + offeringSize);
                    
                    //if we need to take a fraction of the offering
                    //console.log("Cost for " + exchange + " at " + crypto + ":" + (offeringCost*offeringSize));
                    if(amount < offeringSize) {
                        let ratio = amount / offeringSize;
                        cost += offeringCost * amount;
                        amount = 0;                         
                    } else {
                        amount -= offeringSize;
                        cost += offeringCost*offeringSize;
                    }
                } 
  
                output['offerings'].push(
                    { 
                        "Exchange": exchange, 
                        "CryptoCurrency" : req.params.cryptoCurrency,
                        "Amount": req.params.amount,
                        "Currency": req.params.currency,
                        "Price" : cost
                    });         
               
            }
            res.json(output);
    })
})

app.get("/api/offerings/bids/marketDepth/:currency/:exchange/:cryptoCurrency", (req, res) => {
    const databasePath = "TRADES/bids/" + req.params.currency + "/" + req.params.exchange + "/" + req.params.cryptoCurrency;
    db.ref(databasePath).on('value', (snapshot) => {
        res.json(snapshot.val());
    })
})

app.get("/api/offerings/asks/marketDepth/:currency/:exchange/:cryptoCurrency", (req, res) => {
    const databasePath = "TRADES/asks/" + req.params.currency + "/" + req.params.exchange + "/" + req.params.cryptoCurrency;
    db.ref(databasePath).on('value', (snapshot) => {
        res.json(snapshot.val());
    })
})



exports.RESTEndpoints = functions.https.onRequest(app);