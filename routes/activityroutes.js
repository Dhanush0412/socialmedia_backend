let express = require("express")
let router = express.Router();
let verifytoken = require("../middelware/auth")
let updatedactivity = require("../controllers/activitycontroller")

router.post("/update",verifytoken,updatedactivity)

module.exports=router