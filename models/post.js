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
    }],
    status: {
    type:String,
    enum: ["draft", "published"],
    default: "draft"
     }
},{
    timestamps:true
})

let Post = mongoose.model(
    "Post",
    postSchema
)

module.exports=Post