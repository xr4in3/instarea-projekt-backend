const mongoose = require("mongoose")
const Schema = mongoose.Schema

const VenueSchema = new Schema({
    name: {type: String, required: true},
    cat: {type: String, required: true},
    contact: {type: String, required: true},
    likes: {type: Number},
    rating: {type: Number},
    location: {type: Schema.Types.Mixed},
    description: {type: String},
    price: {type: Number, default: null},
    hours: {type: Schema.Types.Mixed},
    isOpen: {type: Boolean, default: true},
    icon: {type: Schema.Types.Mixed},




})

mongoose.model("venues", VenueSchema);