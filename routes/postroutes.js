let express = require("express")
let router = express.Router();
let upload= require("../config/multer")
let {createpost,getfeed} = require("../controllers/postcontroller")
router.post(
    "/",
    upload.single("media"),
    createpost
);
router.get("/feed/:profileid",getfeed)
module.exports=router