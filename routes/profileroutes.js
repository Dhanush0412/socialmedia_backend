let express = require("express")
let upload= require("../config/multer")
let verifytoken=require("../middelware/auth")
let router = express.Router();

let {createprofile,getdashboard,updatedprofilepic,bioupdate,profileedit} = require("../controllers/profilecontroller");
router.post("/create",verifytoken,upload.single("profilepic"),createprofile);
router.get("/dashboard",verifytoken,getdashboard);
router.put("/profilepic",verifytoken,upload.single("profilepic"),updatedprofilepic)
router.put("/bio",verifytoken,bioupdate)
router.put("/edit",verifytoken,upload.single("profilepic"),profileedit)

module.exports= router;