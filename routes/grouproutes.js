let express = require("express")
let verifytoken=require("../middelware/auth")
let upload= require("../config/multer")
let router = express.Router()

let {creategroup,sendgroupinvite,getpendinginvites, acceptinvite,rejectinvite,getmygroup,getgroupdetails,groupexit,searchConnectedUsers,getRejectedInvites,updategrouppic} = require("../controllers/groupcontroller")
router.post("/new",verifytoken,upload.single("groupimage"),creategroup)
router.post("/sendinvite/:groupid/:receiverid",verifytoken,sendgroupinvite)
router.get("/invites",verifytoken,getpendinginvites)
router.put("/accept/:inviteid",verifytoken,acceptinvite)
router.put("/reject/:inviteid",verifytoken,rejectinvite)
router.get("/searchconnecteduser/:groupid",verifytoken,searchConnectedUsers)
router.get("/rejectedlist/:groupid",verifytoken,getRejectedInvites)
router.get("/mygroups",verifytoken,getmygroup)
router.get("/details/:groupid",getgroupdetails)
router.put("/:groupid/profilepic",verifytoken,upload.single("groupimage"),updategrouppic);
router.put("/exit/:groupid",verifytoken,groupexit)

module.exports=router;