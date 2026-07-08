let mongoose = require("mongoose")

let blacklisttokenschema = mongoose.Schema({
    token:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    }
})
blacklisttokenschema.index(
    {
        expiresAt:1
    },
    {
        expireAfterSeconds:0
    }
);

let BlacklistToken = mongoose.model(
    "BlacklistToken",
    blacklisttokenschema
)

module.exports=BlacklistToken