let mongoose = require("mongoose")
const Profile = require("./profile")

let postSchema = mongoose.Schema({
    media:{
        type:String
    },
    caption:{
        type:String
    },
    profile:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile"
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile"
    }]
},{
    timestamps:true
})

let Post = mongoose.model(
    "Post",
    postSchema
)

module.exports=Post