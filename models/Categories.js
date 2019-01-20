const mongoose = require("mongoose")
const Schema = mongoose.Schema
const CategoriesSchema = new Schema({
   data : {type: Schema.Types.Mixed},


})

mongoose.model("categories", CategoriesSchema);