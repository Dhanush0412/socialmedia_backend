let express = require("express")
let router = express.Router();
let verifytoken=require("../middelware/auth")
let {sendrequest,pendingrequest,acceptrequest,rejectrequest,getconnections,blockuser,unblockuser,blockedusers}= require("../controllers/connectionrequestcontroller")

router.post("/send/:receiverid",verifytoken,sendrequest);
router.get("/pending",verifytoken,pendingrequest);
router.put("/accept/:requestid",verifytoken,acceptrequest);
router.put("/reject/:requestid",verifytoken,rejectrequest);
router.post("/blockuser/:blockprofileid",verifytoken,blockuser);
router.delete("/unblock/:unblockprofileid",verifytoken,unblockuser);
router.get("/blocked",verifytoken,blockedusers)
router.get("/list",verifytoken,getconnections);
module.exports=router;