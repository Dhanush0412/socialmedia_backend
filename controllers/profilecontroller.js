
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

module.exports={createprofile,getdashboard,updatedprofilepic,bioupdate,profileedit};