let jwt = require("jsonwebtoken")
let BlacklistToken = require("../models/blacklisttoken")
// logout method //
let logout = async(req,res)=>{
    try {
        let token =req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(404).send("token not found")
        }
        let decoded = jwt.decode(token)
         await BlacklistToken.create({
            token,
            expiresAt:
            new Date(
                decoded.exp * 1000
            )
        });
        return res.status(200).send("Logged Out Successfully")
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal error")
    }
}

module.exports=logout