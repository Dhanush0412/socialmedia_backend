let express = require("express")
let router = express.Router()
let verifytoken=require("../middelware/auth")
let {sendmessage,getgroupmessage} = require("../controllers/messagecontroller")


router.post("/chat",verifytoken,sendmessage)
router.get("/getting/:groupid",verifytoken,getgroupmessage)

module.exports=router