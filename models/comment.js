let mongoose = require("mongoose")
let Profile = require("../models/profile")
let Post = require("../models/post")

let commentschema = mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }

},{
    timestamps:true
})

let Comment = mongoose.model(
    "Comment",
    commentschema
)

module.exports=Comment