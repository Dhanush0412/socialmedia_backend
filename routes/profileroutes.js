let express = require("express")
let upload= require("../config/multer")
let router = express.Router();

let {createprofile,getdashboard, connectionprofile,updatedprofilepic} = require("../controllers/profilecontroller");
const upload = require("../config/multer");

router.get("/:profileid",getdashboard);
router.post("/:profileid/:friendid",connectionprofile)
router.put("/profilepis/:profileid",upload.single("profilepic"),updatedprofilepic)
module.exports= router;