let mongoose= require("mongoose")

let ProfileSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    bio:{
        type: String,
        maxlength:50
    },
    profilepic:{
       type:String,
       default:"default-profile.jpg"
    },
    groups:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group"
    }],
    connections:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile"
    }],
    blockedusers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile"
    }],
    theme:[{
        type:String,
        enum:["light","dark"],
        default:"light"
    }]
})
let Profile = mongoose.model(
    "Profile",
    ProfileSchema
)
module.exports=Profile;