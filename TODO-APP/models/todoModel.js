const mongoose = require("mongoose");
const Schema = mongoose.Schema

const todoSchema = new Schema({
    todo:{ 
        type: String,
        required : true,
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    //Something went be wrong
    username:{ 
        type : String,
        required : true,   
    },
},
{ 
    timestamps : true,
}
);

module.exports= mongoose.model("todo", todoSchema)