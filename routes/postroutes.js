let express = require("express")
let router = express.Router();
let upload= require("../config/multer")
let {createpost,getfeed,likes,unlike,getpost} = require("../controllers/postcontroller")
router.post("/create/:profileid",upload.single("media"),createpost);
router.put("/likes/:postid/:profileid",likes)
router.put("/unlike/:postid/:profileid",unlike)
router.get("/feed/:profileid",getfeed)
router.get("/search",getpost)
module.exports=router