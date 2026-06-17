let Group = require("../models/group")
let Profile = require("../models/profile")
let Groupinvite=require("../models/groupinvite")
let creategroup = async(req,res)=>{
    try {
        let {groupname,profileid}=req.body
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.send("profile not found")
        }
        let group = new Group({
            groupname:groupname,
            createdby:profileid,
            members:[profileid]
        })
        profile.groups.push(group._id)
        await group.save()
        await profile.save()
        return res.json(group)
    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}

let sendgroupinvite =
async(req,res)=>{

    try{

        let {
            groupid,
            senderid,
            receiverid
        } = req.body;

        let group =
        await Group.findById(
            groupid
        );

        if(!group){

            return res.send(
                "group not found"
            );

        }

        if(

            group.createdby.toString()!==senderid){

            return res.send("only admin can invite");

        }

        let sender =
        await Profile.findById(senderid);

        if(!sender.connections.includes(receiverid))
            {

            return res.send("user not connected");

        }

        let existingInvite =await Groupinvite.findOne({

            group:groupid,

            receiver:receiverid,

            status:"pending"

        });

        if(existingInvite){

            return res.send(
                "invite already sent"
            );

        }

        let invite =new Groupinvite({

            group:groupid,

            sender:senderid,

            receiver:receiverid

        });
        await invite.save();

        return res.send(
            "invite sent"
        );

    }

    catch(error){

        console.log(error);

        return res.send(
            "internal error"
        );

    }

}
   let getpendinginvites =async(req,res)=>{

    try{

        let { profileid } = req.params;

        let invites = await Groupinvite.find({

            receiver:profileid,

            status:"pending"

        })

        .populate("group")

        .populate("sender");

        return res.json(invites);

    }

    catch(error){

        console.log(error);

        return res.send("internal error");

    }

}

 let acceptinvite =async(req,res)=>{

    try{

        let { inviteid } =req.params;

        let invite =await Groupinvite.findById(inviteid);

        if(!invite){

            return res.send("invite not found");
        }

        if(invite.status!=="pending"){

            return res.send("invite already processed");

        }

        invite.status ="accepted";

        await invite.save();

        let group =await Group.findById(invite.group);

        let profile =await Profile.findById(invite.receiver);

        if(!group.members.includes(invite.receiver)){

            group.members.push(invite.receiver);

        }

        if(
            !profile.groups.includes(
                invite.group
            )
        ){

            profile.groups.push(
                invite.group
            );

        }

        await group.save();

        await profile.save();

        return res.send(
            "invite accepted"
        );

    }

    catch(error){

        console.log(error);

        return res.send(
            "internal error"
        );

    }

}

let rejectinvite = async(req,res)=>{
    try {
        
        let { inviteid } =req.params;

        let invite =await Groupinvite.findById(inviteid);

        if(!invite){

            return res.send("invite not found");
        }

        if(invite.status!=="pending"){

            return res.send("invite already processed");

        }
        invite.status="rejected"

        await invite.save();
        return res.send("invite rejected")

    } catch (error) {
        console.log(error)
        return res.send("Internal error")
    }
}

let getmygroup= async (req,res)=>{
    try {

        let {profileid} = req.params
        let profile = await Profile.findById(profileid)
        .populate("groups")
        if(!profile){
            return res.send("profile not found")
        }
        return res.json(profile.groups);
    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}


module.exports={creategroup,sendgroupinvite,getpendinginvites,acceptinvite,rejectinvite,getmygroup};