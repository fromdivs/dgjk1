if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

console.log(stripeSecretKey, stripePublicKey);

const express = require("express");
const path= require("path")
const app = express();
const fs = require("fs");
const stripe = require('stripe')(stripeSecretKey)

//const publicDirectory= path.join(__dirname, './public')
// console.log(__dirname);
// console.log(publicDirectory)
//app.use(express.static(publicDirectory))

app.set("view engine", "ejs");
app.use(express.json())
app.use(express.static("public"));


app.get("/store", function (req, res) {
  fs.readFile("items.json", function (error, data) {
    if (error) {
      res.status(500).end();
    } else {
      res.render("store.ejs", {
        stripePublicKey: stripePublicKey,
        items: JSON.parse(data),
      });
    }
  });
});

app.post("/purchase", function (req, res) {
  fs.readFile("items.json", function (error, data) {
    if (error) {
      res.status(500).end();
    } else {
      // console.log("purchase");
      const itemsJson = JSON.parse(data)
      const itemsArray = itemsJson.mobile.concat(itemsJson.refrigerator, itemsJson.television)
      let total=0
      req.body.items.forEach(function(item){
        const itemJson=itemsArray.find(function(i){
          return i.id= item.id
        })
        total=total + itemJson.price * itemJson.quantity 
      })
      stripe.charges.create({
        amount: total,
        source: req.body.stripeTokenId,
        currency: 'inr'
      }).then(function(){
        console.log('charge Successful')
        res.json({message: 'Successfully purchased item'})
      }).catch(function(){
        console.log('charge fail')
        res.status(500).end()
      })
    }
  });
});

app.listen(3000);
