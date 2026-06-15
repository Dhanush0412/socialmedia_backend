let express = require("express")
let router = express.Router();
let {signup,login, forgotpassword} = require("../controllers/usercontroller")

router.post("/singnp",signup)
router.post("/login",login)
router.put("/forgot",forgotpassword)
module.exports=router;