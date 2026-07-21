let express = require("express")
let router= express.Router();
let verifytoken=require("../middelware/auth")
let {senddirectmessage,getdirectmessage,markmessagesread,unreadcount,getchatlist,deletemessage,editmessage} = require("../controllers/directmessagecontroller")

router.post("/sending/:receiverid",verifytoken,senddirectmessage)
router.get("/chatlist",verifytoken,getchatlist)
router.get("/unread",verifytoken,unreadcount)
router.put("/read/:receiverid",verifytoken,markmessagesread)
router.get("/getting/:receiverid",verifytoken,getdirectmessage)
router.delete("/delete/:directmessageid",verifytoken,deletemessage)
router.put("/edit/:dmessageid",verifytoken,editmessage)
module.exports=router