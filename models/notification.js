let mongoose = require("mongoose")
let Profile = require("../models/profile")

let notificationschema = mongoose.Schema({
    receiverid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required:true
    },
    senderid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required:true
    },
    type:{
        type:String,
        enum:[
            "connectionrequest",
            "connectionaccepted",
            "groupinvite",
            "like",
            "comment"
        ],
        required:true
    },
    message:{
        type:String,
        required:true
    },
    read:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

let Notification = mongoose.model(
    "Notification",
    notificationschema
)

module.exports=Notification;