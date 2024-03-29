const express = require("express")
require('dotenv').config()
const path = require("path")
const app = new express()
const publicPath = path.join(__dirname)
const port = process.env.PORT || 5000;
const cors = require('cors');
const bodyParser = require("body-parser");
const helmet = require("helmet")
const compression = require('compression')
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
require("./models/Categories")
require("./models/Venue")
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })

app.use(bodyParser.json());
app.use(helmet())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath))
app.use(cors());
app.use(compression());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
// initial json imports, manual category grouping needed if required
let catData = (require("./catSet.json"))
const Categories = mongoose.model('categories')
Categories.collection.insert(catData, (err, result) => {
    if(err){
        console.log(err)
    }
    else{
        console.log(result)
    }
})
const dbImport = require("./dbimport.json")
const Venues = mongoose.model("venues");
Venues.collection.insertMany(dbImport, (err, result) => {
    if(err){
        console.log(err)
    }
    else{
        console.log(result)
    }
})


require("./routes/routes")(app)
app.get("*", (req, res) => {   
    res.sendFile(path.join(publicPath, "index.html"))
})
app.listen(port, () => { console.log("server is up, port: ", port) })
module.exports = { app }