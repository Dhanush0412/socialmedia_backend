let User = require("../models/user")
let Profile = require("../models/profile")
let bcrypt = require("bcrypt")
let Otp = require("../models/otp")
let jwt = require("jsonwebtoken")
let {transporter,sendloginmail} = require("../config/mail")

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
    let otpverified =await Otp.findOne({
      email:email,
      verified:true
        });
   if(!otpverified){
    return res.send("verify email first");
    }
    let user = new User({
        username:username,
        email:email,
        phone:phone,
        password:hashedpassword
     })
     
     await user.save()
     await Otp.deleteMany({
     email:email
     });

   return res.status(201).send("signed up successfully");

    } catch (error) {
        console.log(error)
    return res.status(500).send("internal error")
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
        return res.status(404).send("User not exist")
    }

    let ismatch = await bcrypt.compare(
        password,
        userexist.password
    )
    if(!ismatch){
        return res.status(400).send("invalid password")
    }
    let profile =await Profile.findOne({user:userexist._id});
    
    let token = jwt.sign(
        {
            userid:userexist._id
        },
        process.env.JWT_SECRET,
        {
           expiresIn:"7d" 
        }
    )

    sendloginmail(userexist.email,userexist.username)

    return res.json({
    message:"loggedin successfully",
    token,
    userid:
    userexist._id,
    username:userexist.username,
    profileexists:
    profile ? true : false,

    profileid:
    profile ?
    profile._id:null

    });

  }
   catch (error) {
    return res.status(500).send("internal error")
  }
}

// forgot password //

let forgotpassword = async (req,res)=>{
    try {
        let {login, newpassword, confirmpassword} = req.body
        if(newpassword !== confirmpassword){
            return res.status(400).send("password mismatch")
        }
        let userexist = await User.findOne({
            $or:[
                {email:login},{phone:login}
            ]
        })
        if(!userexist){
            return res.status(404).send("user not found")
        }
        let otpverified = await Otp.findOne({
         email:userexist.email,
         verified:true
        });
     if(!otpverified){
    return res.status(403).send("verify otp first");
    }
        let hashedpassword = await bcrypt.hash(newpassword, 10);
        userexist.password = hashedpassword;
        await userexist.save();
        let updatedUser = await User.findById(userexist._id);
          await Otp.deleteMany({
           email: userexist.email
          });
         return res.status(201).send("password updated successfully");
       } catch (error) {
       return res.status(500).send("internal error")   
    }
}
// sending OTP //

let sendotp = async(req,res)=>{
    try {
        let {email} = req.body
        let existingotp = await Otp.findOne({
            email:email,
            expiresAt:{
                $gt:new Date()
            }
        })

        if(existingotp){
            return res.send( "OTP already sent. Wait 5 minutes.")
        }

        let otp = Math.floor(100000+Math.random()*900000)
        await transporter.sendMail({
            from:process.env.EMAIL,
            to:email,
            subject:"PandaChat Email Verification OTP",
            text:`Welcome to PandaChat Your Email Verification OTP is: ${otp} This OTP is valid for 5 minutes. Do not share this OTP with anyone. Team PandaChat`

        })
        await Otp.create({ email,otp,verified:false,expiresAt:new Date(Date.now() + 5*60*1000)
});
        return res.status(200).send("OTP sent successfully");
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error");
    }
}
// verify otp //

let verifyotp = async(req,res)=>{
    try {

        let {email, otp} = req.body;

        let otpdata = await Otp.findOne({
            email: email
        }).sort({
            createdAt: -1
        });

        if(!otpdata){
            return res.status(404).send("OTP not found");
        }
        if(otpdata.expiresAt < new Date()){
            return res.status(400).send("OTP expired");
        }
        if(String(otpdata.otp) !== String(otp)){
            return res.status(400).send("Invalid OTP");
        }
        otpdata.verified = true;
        await otpdata.save();
        return res.status(200).send("Email verified");
    } catch(error){
        console.log(error);
        return res.status(500).send("Internal error");
    }
}
// send forgototp//
let sendforgototp = async(req,res)=>{
    try {
        
        let {login}=req.body
        let user = await User.findOne({
            $or:[
                {email:login},{phone:login}
            ]
        })
        if(!user){
            return res.status(404).send("user not found")
        }
        let email =user.email;
         let existingotp = await Otp.findOne({
            email:email,
            expiresAt:{
                $gt:new Date()
            }
        })

        if(existingotp){
            return res.status(429).send( "OTP already sent. Wait 5 minutes.")
        }
        let otp = Math.floor(100000+Math.random()*900000)
        await transporter.sendMail({
            from:process.env.EMAIL,
            to:email,
            subject:"PandaChat Email Verification OTP",
            text:`Your Forgot Password  Email Verification OTP is: ${otp} This OTP is valid for 5 minutes. Do not share this OTP with anyone. Team PandaChat`

        })
        await Otp.create({ email,otp,verified:false,expiresAt:new Date(Date.now() + 5*60*1000)
     });
        return res.status(200).send("OTP sent successfully");
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}
// verify forgot password //
let verifyforgototp = async(req,res)=>{
    try{
        let {login,otp}=req.body;
        let user = await User.findOne({
            $or:[
                {email:login},
                {phone:login}
            ]
        });

        if(!user){
            return res.status(404).send("User not found");
        }
        let otpdata = await Otp.findOne({
            email:user.email,
            verified:false

        }).sort({
            createdAt:-1
        });
        
        if(!otpdata){
            return res.status(404).send("OTP not found");
        }
        if(otpdata.expiresAt < new Date()){
            return res.status(400).send("OTP expired");
        }
        if(String(otpdata.otp)!==String(otp)){
            return res.status(400).send("Invalid OTP");
        }
        otpdata.verified=true;
        await otpdata.save();
        return res.status(200).send("OTP verified");
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal error");
    }
}
// search any user //
let searchuser = async (req, res) => {
    try {
        let profileid = req.profileid;
        let { username } = req.query;
        if (!username) {
            return res.status(400).send("Username is required");
        }
        let myProfile =await Profile.findById(profileid);
        if (!myProfile) {
            return res.status(404).send("Profile not found");
        }
        let profiles =await Profile.find()
        .populate("user");
        let result = profiles.filter(profile =>
                profile.user &&
                profile.user.username
                    .toLowerCase()
                    .includes(username.toLowerCase()) &&
                String(profile._id) !== String(profileid) &&
                !myProfile.connections.some(
                    id => String(id) === String(profile._id)
                )
            );
          return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal error");
    }
};


module.exports = {signup,login,forgotpassword,sendotp,verifyotp,searchuser,sendforgototp,verifyforgototp};