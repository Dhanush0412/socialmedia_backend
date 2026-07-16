let bcrypt = require("bcrypt")
let Profile = require("../models/profile")
let User = require("../models/user")
let Post = require("../models/post")
let Defaultpic = "https://res.cloudinary.com/dubjosis9/image/upload/v1782300064/demoimage_b0q161.jpg"

// creating profile //
let createprofile = async(req,res)=>{
   try{
    let userid= req.userid
     let{bio} = req.body
    let userexist = await User.findById(userid)
    if(!userexist){
        return res.status(401).send("user not exist")
    }
    let profileexist = await Profile.findOne({user:userid})
    if(profileexist){
        return res.status(401).send("profile already existing")
    }
   let profile = new Profile({
    bio:bio,
    user:userid,
    profilepic:
    req.file
    ?
    req.file.path:Defaultpic
})
    await profile.save()
    return res.json({
    message:"profile created",
    profileid:profile._id
   });
   }
   catch(error){
    console.log(error);
    return res.status(500).send("internal error")
   }
}

// Getting dashboard //
let getdashboard = async(req,res)=>{
   try {
    let profileid = req.profileid;
    let profile = await Profile.findById(profileid)

    .populate("user")
    if(!profile){
        return res.status(401).send("profile not exist")
    }
    let totalposts = await Post.countDocuments({profile:profileid});  
    return res.json({
        profileid : profile._id,
        username : profile.user.username,
        bio:profile.bio,
        profilepic : profile.profilepic,
        groups : profile.groups.length,
        connections:profile.connections.length,
        posts:totalposts
    })
   
   } catch (error) {
      console.log(error)
      return res.send("internal error")
   }
}

// profile pic updation //

let updatedprofilepic = async(req,res)=>{
    try {
        let profileid = req.profileid
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.send("profile not exist")
        }
        if(!req.file){
    return res.send("please upload image");
  }
    profile.profilepic =req.file.path;
        await profile.save();
        return res.json({
            message:"profile pic updated successfully",
            profilepic:profile.profilepic
        })

    } catch (error) {
        return res.send("internal error in profile setting")
    }
}


// bio update for setting //

let bioupdate = async(req,res)=>{
    try {
        let profileid = req.profileid
        let {bio} = req.body
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile is not found")
        }
        if(bio == ""){
            return res.status(400).send("bio required");
        }
        profile.bio=bio;
        await profile.save()
        return res.json({
            message:"bio updated",
            bio:profile.bio
        });
    } catch (error) {
       console.log(error)
       return res.status(500).send("internal error") 
    }
}

// profile edit (bio + profile edit) //

let profileedit = async(req,res)=>{
    try {
        let profileid = req.profileid
        let {bio} = req.body        
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile not found")
        }
        if(bio){
            profile.bio=bio
        }
        if(req.file){
            profile.profilepic=req.file.path;
        }
        await profile.save();
        return res.json({
            message:"profile edited",
            bio:profile.bio,
            profilepic:profile.profilepic
        })
    } catch (error) {
       console.log(error)
       return res.status(500).send("internal error")   
    }
}
// changing password in setting //
let changepassword = async (req, res) => {
    try {
        let profileid = req.profileid;
        let {currentpassword,newpassword,confirmpassword} = req.body;
        if (!currentpassword || !newpassword || !confirmpassword) {
            return res.status(400).send("All fields are required");
        }
        if (newpassword.length < 8) {
            return res.status(400).send("Password must be at least 8 characters long");
        }
        const strongPassword =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPassword.test(newpassword)) {
            return res.status(400).send(
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
                 );
        }
        if (newpassword !== confirmpassword) {
            return res.status(400).send("Password mismatch");
        }
        let profile = await Profile.findById(profileid)
            .populate("user");
        if (!profile) {
            return res.status(404).send("Profile not found");
        }
        let user = profile.user;
        let isCurrentPasswordCorrect = await bcrypt.compare(
            currentpassword,
            user.password
        );

        if (!isCurrentPasswordCorrect) {
            return res.status(400).send("Current password is incorrect");
        }

        let isSamePassword = await bcrypt.compare(
            newpassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).send(
                "New password cannot be the same as your current password"
            );
        }

        let hashedPassword = await bcrypt.hash(
            newpassword,
            10
        );
        user.password = hashedPassword;
        await user.save();
        return res.status(200).send("Password updated successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};
// delete account it will delete only userid and profileid from the database)
let deleteaccount = async(req,res)=>{
    try {
        let profileid = req.profileid
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile not found")
        }
        let userid = profile.user
        await User.findByIdAndDelete(userid)
        await Profile.findByIdAndDelete(profileid)
        return res.status(200).send("Successfully Account Deleted")
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal error")
    }
}

module.exports={createprofile,getdashboard,updatedprofilepic,bioupdate,profileedit,changepassword,deleteaccount};