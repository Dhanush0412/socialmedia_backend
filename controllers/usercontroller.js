let User = require("../models/user")
let Profile = require("../models/profile")
let bcrypt = require("bcrypt")

// signup //

let signup = async(req,res)=>{
  try {
    let {username,email,phone,password}=req.body
    if(!username || !email || !phone || !password){
        return res.status(400).send("all fields or required")
    }
    let emailval =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailval.test(email)){
        return res.status(400).send("invalid email format")
    }
    let phnval =  /^[0-9]{10}$/;
    if(!phnval.test(phone)){
        return res.status(400).send("invalid phone number format")
    }
    let passwordval =/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
     if(!passwordval.test(password)){
        return res.status(400).send("password contain 8 character and atleast one Uppercase,Special character")
     }
    let userexist = await User.findOne({
        $or:[
         {username},
         {email},
         {phone}
        ]
    })

    if(userexist){
        return res.status(401).send("User already exist")
    }
    let hashedpassword = await bcrypt.hash(
        password,
        10
    )
    let user = new User({
        username:username,
        email:email,
        phone:phone,
        password:hashedpassword
    })
     await user.save()
     return res.send("signed up successfully")
    
  } catch (error) {
    return res.send("internal error")
  }
    
}
// login //

let login = async(req,res)=>{
  try {
     let {login,password} = req.body
    let userexist = await User.findOne({
        $or:[
         {email:login},
         {phone:login}
        ]
    })

    if(!userexist){
        return res.status(401).send("User not exist")
    }

    let ismatch = await bcrypt.compare(
        password,
        userexist.password
    )
    if(!ismatch){
        return res.status(401).send("invalid password")
    }
    let profile =await Profile.findOne({user:userexist._id});

return res.json({

    message:"loggedin successfully",

    userid:
    userexist._id,
    username:userexist.username,
    profileexists:
    profile ? true : false,

    profileid:
    profile ?
    profile._id:null

});

  } catch (error) {
    return res.send("internal error")
  }
}

// forgot password //

let forgotpassword = async (req,res)=>{
    try {
        let {login, newpassword, confirmpassword} = req.body

        if(newpassword !== confirmpassword){
            return res.send("password mismatch")
        }
        let userexist = await User.findOne({
            $or:[
                {email:login},{phone:login}
            ]
        })
        if(!userexist){
            return res.status(401).send("user not found")
        }
        let hashedpassword = await bcrypt.hash(
            newpassword,10
        )
        userexist.password=hashedpassword
        await userexist.save()
        return res.send("password updated successfully")
    } catch (error) {
       return res.send("internal error")   
    }
}

module.exports = {signup,login,forgotpassword};