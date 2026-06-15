let express = require("express")

let router = express.Router()

let {creategroup,joingroup} = require("../controllers/groupcontroller")
router.post(
    "/",creategroup
)
router.put(
    "/:groupid/:profileid",
    joingroup
)

module.exports=router;