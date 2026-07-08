let logout = require("../controllers/blacklisttokencontroller")
let verifytoken = require("../middelware/auth")
let express = require("express")
let router = express.Router();

router.post("/logout",verifytoken,logout)

module.exports=router