let express = require("express")
let verifytoken=require("../middelware/auth")
let router = express.Router()

let {creategroup,sendgroupinvite,getpendinginvites, acceptinvite,rejectinvite,getmygroup,getgroupdetails} = require("../controllers/groupcontroller")
router.post("/new",verifytoken,creategroup)
router.post("/sendinvite/:groupid/:receiverid",verifytoken,sendgroupinvite)
router.get("/invites",verifytoken,getpendinginvites)
router.put("/accept/:inviteid",acceptinvite)
router.put("/reject/:inviteid",rejectinvite)
router.get("/mygroups",verifytoken,getmygroup)
router.get("/details/:groupid",getgroupdetails)


module.exports=router;