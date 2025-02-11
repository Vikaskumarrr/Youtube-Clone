const mongoose = require("mongoose");
const { type } = require("os");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { 
        type: String,
        require: true
    }, 
    username: { 
        type: String,
        require: true,
        unique: true,
        minLength: 3,
        maxLength: 50
    },
    email: { 
        type: String,
        require: true,
        unique: true,
        minLength: 3,
        maxLength: 50
    } ,
    password: { 
        type: String,
        require: true,
        select: false,
    } ,

});


module.exports = mongoose.model("user", userSchema);