let Group = require("../models/group")
let Profile = require("../models/profile")
let Groupinvite=require("../models/groupinvite")
let Message = require("../models/message")
let Notification = require("../models/notification")
let Grouppic = "https://res.cloudinary.com/dubjosis9/image/upload/v1782723497/the-metropolitan-museum-of-art-eXVnyU2unms-unsplash_s5td03.jpg"
// group creation method  //
let creategroup = async(req,res)=>{
    try {
        let profileid=req.profileid
        let groupname = req.body?.groupname;

        if (!groupname) {
         return res.status(400).send("Group name is required");
           }
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile not found")
        }
        let group = new Group({
            groupname:groupname,
            groupimage: 
            req.file
            ?
            req.file.path:Grouppic,
            createdby:profileid,
            members:[profileid]
        })
        profile.groups.push(group._id)
        await group.save()
        await profile.save()
        return res.json(group)
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

 // sending group invite to someone //
let sendgroupinvite =async(req,res)=>{
      try{
        let senderid= req.profileid
        let {groupid} = req.params
        let {receiverid} = req.params;

        let group =await Group.findById(groupid);

        if(!group){
            return res.status(404).send("group not found");
        }
        if(String(senderid) === String(receiverid)){
            return res.status(400).send("cannot invite yourself");
         }
         let inviter = await Profile.findById(senderid);
         let invited = await Profile.findById(receiverid);
          if (inviter.blockedusers.includes(receiverid) ||
              invited.blockedusers.includes(senderid))
             {
              return res.status(403).send("Cannot invite this user.");
             }
        if(group.createdby.toString()!== String(senderid)){
           return res.status(401).send("only admin can invite");
         }

        let sender =await Profile.findById(senderid);

        if(!sender.connections.includes(receiverid))
            {
            return res.status(401).send("user not connected");
        }

        let existingInvite =await Groupinvite.findOne({
            group:groupid,
            receiver:receiverid,
            status:"pending"
        });
        if(group.members.includes(receiverid)){
            return res.status(429).send("user all ready exist in the group")
        }
        if(existingInvite){
            return res.status(429).send("invite already sent");
        }
        let invite =new Groupinvite({
            group:groupid,
            sender:senderid,
            receiver:receiverid
        });
        await invite.save();
        await Notification.create({
         receiverid:receiverid,
         senderid:senderid,
         type:"groupinvite",
         message:"invited you to a group"
        });
        return res.status(200).send("invite sent");

    }

    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }
}
// get the pending request //
   let getpendinginvites =async(req,res)=>{
    try{
        let profileid  = req.profileid;
        let invites = await Groupinvite.find({
            receiver:profileid,
            status:"pending"
        })
        .populate("group")
        .populate({
         path: "sender",
         select: "profilepic user",
         populate: {
         path: "user",
         select: "username"
         }
        });
        return res.json(invites);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }

}

 // accept the group invites //
 let acceptinvite =async(req,res)=>{
    try{
        let receiver = req.profileid
        let  {inviteid} =req.params;
        let invite =await Groupinvite.findById(inviteid);
        if(!invite){
            return res.status(404).send("invite not found");
        }
        if(invite.status!=="pending"){
            return res.status(429).send("invite already processed");
        }
          if(String(invite.receiver)!== String(req.profileid)){
           return res.status(401).send("unauthorized");
         }
        invite.status ="accepted";
        await invite.save();
        let group =await Group.findById(invite.group);
        let profile =await Profile.findById(invite.receiver);
        
        if(!group.members.includes(invite.receiver)){
            group.members.push(invite.receiver);
        }
        if(!profile.groups.includes(invite.group)){
            profile.groups.push(invite.group);
        }
        await group.save();
        await profile.save();
        return res.status(200).send("invite accepted");
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }
}
// reject group invite //
let rejectinvite = async(req,res)=>{
    try {
        let { inviteid } =req.params;
        let invite =await Groupinvite.findById(inviteid);
        if(!invite){
            return res.status(404).send("invite not found");
        }
        if(invite.status!=="pending"){
            return res.status(429).send("invite already processed");
        }
        if(String(invite.receiver)!== String(req.profileid)){
           return res.status(401).send("unauthorized");
         }
        invite.status="rejected"
        await invite.save();
         await Notification.create({
              receiverid: invite.sender,
              senderid: invite.receiver,
              type: "grouprejected",
              message: "rejected your group invitation"
             });
        return res.status(200).send("invite rejected")
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal error")
    }
}

// getting group  //
let getmygroup= async (req,res)=>{
    try {

        let profileid = req.profileid
        let profile = await Profile.findById(profileid)
        .populate("groups")
        if(!profile){
            return res.status(404).send("profile not found")
        }
        return res.json(profile.groups);
    } 
    catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// groupchatpreview //
let groupchatpreview = async(req,res)=>{
    try{
        let profileid  = req.profileid;
        let profile =await Profile.findById(profileid);
        if(!profile){
            return res.status(404).send("profile not found");
        }
        let result =await Message.aggregate([
            {
                $match:{
                    group:{
                        $in:
                        profile.groups
                    }
                }
            },

            {
                $sort:{
                    createdAt:-1
                }
            },

            {
                $group:{

                    _id:"$group",

                    latestMessage:{
                        $first:"$text"
                    },

                    latestTime:{
                        $first:"$createdAt"
                    }

                }
            },

            {
                $lookup:{
                    from:"groups",
                    localField:"_id",
                    foreignField:"_id",
                    as:"group"
                }
            },

            {
                $unwind:"$group"
            },

            {
                $project:{
                    groupid:"$group._id",
                    groupname:"$group.groupname",
                    groupimage:"$group.groupimage",
                    latestMessage:1,
                    latestTime:1
                }
            },
            {
                $sort:{
                    latestTime:-1
                }
            }

        ]);
        return res.json(result);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }

}

// getting group details //

let getgroupdetails = async(req,res)=>{
    try{
        let { groupid } = req.params;
        let group =await Group.findById(groupid)
        .populate("createdby")
        .populate("members");
        if(!group){
            return res.status(404).send("group not found");
        }
        return res.json(group);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }

}

// members can exit the group //
let groupexit = async (req,res)=>{
    try {
        let member = req.profileid;
        let { groupid } = req.params;
        let profile = await Profile.findById(member);
        if(!profile){
            return res.status(404)
            .send("profile not found");
        }
        let group = await Group.findById(groupid);
        if(!group){
            return res.status(404)
            .send("group not found");
        }
        const isMember = group.members.some(
            m => String(m) === String(member)
        );
        if(!isMember){
            return res.status(401).send("you are not in the group");
        }

        const isAdmin =
            String(group.createdby) ===
            String(member);

        if(isAdmin){
            if(group.members.length === 1){
                await Group.findByIdAndDelete(
                    groupid
                );
                await Profile.findByIdAndUpdate(
                    member,
                    {
                        $pull:{
                            groups:groupid
                        }
                    }
                );

                return res.status(200).send("group deleted");
            }
            const newAdmin =
                group.members.find(
                    m =>
                    String(m) !==
                    String(member)
                );
            group.createdby = newAdmin;
        }
        group.members.pull(member);
        await group.save();
        await Profile.findByIdAndUpdate(
            member,
            {
                $pull:{
                    groups:groupid
                }
            }
        );

        return res.status(200).send("successfully exited group");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal error");
    }
}
// searchconnectedusers means in group invite shows only connected user and not display exsisting members in group //
let searchConnectedUsers = async (req, res) => {
    try {
        let profileid = req.profileid;
        let {groupid} = req.params;
        let { username } = req.query;
        let group = await Group.findById(groupid)
        if(!group){
            return res.status(404).send("group not found")
        }
        if (!username) {
            return res.status(400).send("Username is required");
        }
        let profile =await Profile.findById(profileid);
        if (!profile) {
            return res.status(404).send("Profile not found");
        }
        let result =await Profile.find({
                 _id: {
                    $in:
                    profile.connections,
                    $nin: group.members
                   }
              })
            .populate({
                path: "user",
                match: {
                    username: {
                        $regex:
                            username,
                        $options:
                            "i"
                    }
                }
            });
        result = result.filter(
            p => p.user
        );
        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal error");
    }
};
// reject invites //
let getRejectedInvites = async (req, res) => {
    try {
        let profileid = req.profileid;
        let { groupid } = req.params;
        let group = await Group.findById(groupid);
        if (!group) {
            return res.status(404).send("Group not found");
        }
        if (String(group.createdby) !==String(profileid)) {
            return res.status(401).send("Only admin can view rejected invites");
        }
      let rejectedInvites = await Groupinvite.find({
        group: groupid,
        status: "rejected"
       })
      .populate({
        path: "receiver",
        select: "profilepic bio user",
        populate: {
        path: "user",
        select: "username"
       }
     })
       .sort({
          updatedAt: -1
         });
         return res.json(rejectedInvites);
    } 
    catch (error) {
        console.log(error);
        return res.status(500).send("Internal error");
    }
};
module.exports={creategroup,sendgroupinvite,getpendinginvites,acceptinvite,rejectinvite,getmygroup,getgroupdetails,groupexit,searchConnectedUsers,getRejectedInvites};