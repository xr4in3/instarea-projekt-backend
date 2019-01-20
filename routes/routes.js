const express = require("express");
const app = express();
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
require("../models/Categories")
require("../models/Venue")
const Categories = mongoose.model('categories')
const Venue = mongoose.model("venues")
const qpm = require('query-params-mongo');
const processQuery = qpm()
const santizator = require('express-validator/filter')
const { check } = require('express-validator/check')
module.exports = app => {
  // GET ALL VENUE CATEGORIES
  app.get("/api/categories",(req, res) => {    
    Categories.findOne().sort({$natural: -1}).limit(1).exec(function(err, categories){
      
      if(categories){
        res.status(200).send(categories)
              }
      else if (err){
        res.status(400).send({response: err})
      }
      else {
        res.status(404).send({response: "Not found"})
      }
      })    
})
  //GET ALL VENUE DOCS IN GEOJSON
  app.get("/api/venues/", (req,res) => {
    Venue.find().then(venues => {
      if(venues){       
        res.status(200).send(venues)
      }
      else if(!venues){
        res.status(404).send({response: "Not found "})
      }
      else{
        res.status(400).send({response: "Error "})
      }
    }).catch((e) => console.log(e)) 
  })
  //GET VENUE BY ID
  app.get("/api/venue/:id", (req, res) => {
    let id = req.params.id
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ response: "Invalid ID format!" })
    }
    Venue.findOne({
        _id: id,        
    }).then((venue) => {
        if (venue) {
            res.send({ venue })
        }
        else if (!venue) {
            res.status(404).send({ response: "No venue found" })
        }
    }).catch((e) => console.log(e))
})
  //GET VENUES FILTER QS
  app.get("/api/venues/search", (req, res) => {
    let q 
    santizator.sanitizeQuery().whitelist(["name", "price__gte", "price__lte", "rating", "isOpen", "cat__in"])    

      q = processQuery(req.query)
      Venue.find(q.filter).then((venues) => {
        if(venues){
          res.send({venues})
        }
        else if (!venues) {
          res.status(404).send({response: "No venue found"})
        }
      })
  })
  
}
