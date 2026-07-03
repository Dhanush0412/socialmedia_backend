let express = require("express")
let router = express.Router();
let upload= require("../config/multer")
let verifytoken=require("../middelware/auth")
let {createpost,getfeed,likes,unlike,addcomment,getcomments,deletecomment,getpost,getmyposts,getdraftposts,publishdraft} = require("../controllers/postcontroller")
router.post("/create",verifytoken,upload.single("media"),createpost);
router.put("/likes/:postid",verifytoken,likes)
router.put("/unlike/:postid",verifytoken,unlike)
router.post("/comment/:postid",verifytoken,addcomment)
router.get("/getcomments/:postid",getcomments)
router.delete("/deletecomment/:commentid",verifytoken,deletecomment)
router.get("/feed",verifytoken,getfeed)
router.get("/search",getpost)
router.get("/getmypost",verifytoken,getmyposts)
router.get("/getdraft",verifytoken,getdraftposts)
router.put("/publishdraft/:postid",verifytoken,publishdraft)
module.exports=router