let express = require("express")
let router = express.Router()

let {sendmessage,getmessage} = require("../controllers/messagecontroller")

router.post("/",sendmessage)
router.get("/:groupid",getmessage)

module.exports=router