let express = require("express")
let router= express.Router();

let {senddirectmessage,getdirectmessage} = require("../controllers/directmessagecontroller")

router.post("/",senddirectmessage)
router.get("/:senderid/:receiverid",getdirectmessage)

module.exports=router