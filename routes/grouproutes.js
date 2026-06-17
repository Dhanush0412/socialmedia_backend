let express = require("express")

let router = express.Router()

let {creategroup,sendgroupinvite,getpendinginvites, acceptinvite,rejectinvite,getmygroup} = require("../controllers/groupcontroller")
router.post("/new",creategroup)
router.post("/invite",sendgroupinvite)
router.get("/invite/:profileid",getpendinginvites)
router.put("/accept/:inviteid",acceptinvite)
router.put("/reject/:inviteid",rejectinvite)
router.get("/mygroups/:profileid",getmygroup)

module.exports=router;