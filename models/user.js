let mongoose = require("mongoose")

let UserSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        trim:true
    },
    email:{
       type:String,
       required:true,
       unique:true,
       lowercase:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
    }
})
let User = mongoose.model(
    "User",
    UserSchema
)
module.exports=User;