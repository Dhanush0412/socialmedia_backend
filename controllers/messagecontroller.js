let Message = require("../models/message")
let Group = require("../models/group")
let Profile=require("../models/profile")
let socket = require("../socket/socket")

// send message in group //
let sendmessage = async (req,res)=>{
    try {
        let senderid = req.profileid
        let {groupid} = req.params
        let{text}= req.body
        let group = await Group.findById(groupid)
        if(!group){
            return res.status(404).send("group not found")
        }
        if(!group.members.includes(senderid)){
           return res.status(403).send("you are not a member of this group");
          }
         if(!text || text.trim()===""){
           return res.status(400).send("message required");
          }
         let message = new Message({
            text:text,
            sender:senderid,
            group:groupid
         })
         await message.save()
         let populatemessage = await Message.findById(message._id)
         .populate({
            path:"sender",
            populate:{
                path:"user",
                select:"username"
            }
         })
         .populate("group")
         
         socket.getIO()
         .to(groupid)
         .emit("receivemessage",populatemessage)
         return res.json(populatemessage)
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// getting message in the group //
let getgroupmessage = async(req,res)=>{

    try {
        let profileid = req.profileid
        let {groupid} = req.params;
        let group = await Group.findById(groupid)
        if(!group){
            return res.status(404).send("group not exist")
        }
        if(!group.members.includes(profileid)){
            return res.status(401).send("access denied");
        }
       let messages = await Message.find({
         group: groupid
           })
          .populate("sender")
           .populate(
                "group",
                "groupname groupimage createdby"
            )
          .sort({
             createdAt: 1
            });
            return res.json(messages);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }

}
let deletemessage = async(req,res)=>{
    try {
        let senderid = req.profileid
        let {groupid,messageid} = req.params
         let group = await Group.findById(groupid)
         if(!group){
            return res.status(404).send("group not found")
         }
        let message = await Message.findById(messageid)
        if(!message){
            return res.status(404).send("message not found")
        }
        let groupadmin = group.createdby
        if(String(message.sender) !== String(senderid) && String(group.createdby) !== String(groupadmin)){
            return res.status(401).send("you can't delete the message")
        }
        await Message.findByIdAndDelete(messageid)
        return res.status(200).send("message was deleted")
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal error")
    }
}

// edit message in group chat //

let editmessage = async(req,res)=>{
    try {
        let sender = req.profileid
        let {groupid,messageid} = req.params
        let {text} = req.body
        let group = await Group.findById(groupid)
        let message = await Message.findById(messageid)
        if(!group){
            return res.status(404).send("group not found")
        }
        if(!message){
            return res.status(404).send("message not found")
        }

        if(String(sender) !== String(message.sender)){
            return res.status(401).send("you can't edit this message")
        }
        message.text = String(text)
        await message.save()
        return res.json(message.text)
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal error")
    }
}
module.exports={sendmessage,getgroupmessage,deletemessage,editmessage}