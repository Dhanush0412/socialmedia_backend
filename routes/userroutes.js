let express = require("express")
let router = express.Router();
let verifytoken = require("../middelware/auth")
let {signup,login, forgotpassword,sendotp,verifyotp, searchuser,sendforgototp,verifyforgototp} = require("../controllers/usercontroller")

router.post("/signup",signup)
router.post("/login",login)
router.put("/forgot",forgotpassword)
router.post("/sentotp",sendotp)
router.post("/verifyotp",verifyotp)
router.post("/sendforgototp",sendforgototp)
router.post("/verifyforgototp",verifyforgototp)
router.get("/search",verifytoken,searchuser)
module.exports=router;