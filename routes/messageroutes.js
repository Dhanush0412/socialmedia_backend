let express = require("express")
let router = express.Router()
let verifytoken=require("../middelware/auth")
let {sendmessage,getgroupmessage,deletemessage,editmessage} = require("../controllers/messagecontroller")


router.post("/chat/:groupid",verifytoken,sendmessage)
router.get("/getting/:groupid",verifytoken,getgroupmessage)
router.delete("/delete/:groupid/:messageid",verifytoken,deletemessage)
router.put("/edit/:groupid/:messageid",verifytoken,editmessage)
module.exports=router