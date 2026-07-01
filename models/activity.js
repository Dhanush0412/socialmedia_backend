let mongoose = require("mongoose")
let Profile = require("./profile")

let activityschema = new mongoose.Schema({
     profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
        required:true
     },
     date:{
        type:String,
        required:true
     },
     totalseconds:{
        type:Number,
        default:0
     }
},{
    timestamps:true
})

let Activity = mongoose.model(
    "Activity",
    activityschema
)

module.exports=Activity