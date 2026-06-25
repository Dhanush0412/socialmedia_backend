let jwt= require("jsonwebtoken")
let Profile = require("../models/profile")
let verify = async(req,res,next)=>{
    try {
        let token= req.headers.authorization.split(" ")[1];
        if(!token){
            return res.send("token required")
        }
        let decode = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.userid = decode.userid
        let profile =await Profile.findOne({
          user:decode.userid
         });
         if(profile){
           req.profileid=profile._id
         }
        next();
        
    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}
module.exports=verify