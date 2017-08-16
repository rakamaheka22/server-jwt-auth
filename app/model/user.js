var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//setup mongoose model
module.exports = mongoose.model('User', new Schema({ 
    email: String, 
    password: String, 
    admin: Boolean 
}));