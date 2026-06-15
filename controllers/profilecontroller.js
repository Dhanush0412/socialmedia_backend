
let Profile = require("../models/profile")
let User = require("../models/user")


// creating profile //
let createprofile = async(req,res)=>{
   try{
     let{bio,userid} = req.body
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
        user:userid
    })
    await profile.save()
    return res.send("profile created")
   }
   catch(error){
    console.log(error);
    return res.send("internal error")
   }
}


// Getting dashboard //
let getdashboard = async(req,res)=>{
   try {
       let {profileid} = req.params;
    let profile = await Profile.findById(profileid)

    .populate("user")
    if(!profile){
        return res.status(401).send("profile not exist")
    }
     console.log(profileid)
    console.log(profile)
    return res.json({
        profileid : profile._id,
        username : profile.user.username,
        bio:profile.bio,
        profilepic : profile.profilepic,
        groups : profile.groups.length,
        connections:profile.connections.length
    })
   
   } catch (error) {
      console.log(error)
      return res.send("internal error")
   }
}

// connections //
let connectionprofile = async(req,res)=>{
    try {
        let {profileid,friendid} = req.params;
        let profile = await Profile.findById(profileid);
        let friend = await Profile.findById(friendid);
      
        if(!profile || !friend){
            return res.send("friend profile not found")
        }
         profile.connections.push(friendid)
         friend.connections.push(profileid)
        await profile.save();
        await friend.save();
        return res.send("connected successfully");

    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}

// profile pic updation //

let updatedprofilepic = async(req,res)=>{
    try {
        let {profileid} = req.params
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.send("profile not exist")
        }
        profile.profilepic=req.file.filename;
        await profile.save();
        return res.json({
            message:"profile pic updated successfully",
            profilepic:profile.profilepic
        })

    } catch (error) {
        return res.send("internal error in profile setting")
    }
}

module.exports={createprofile,getdashboard,connectionprofile,updatedprofilepic};