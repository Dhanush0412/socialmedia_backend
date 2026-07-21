const { default: mongoose } = require("mongoose")
let Directmessage=require("../models/directmessage")
let socket = require("../socket/socket")
let Profile = require("../models/profile")
let User = require("../models/user")
// sending direct message //
let senddirectmessage = async(req,res)=>{
   try {
       let senderid = req.profileid
       let {receiverid} = req.params
       let {text} = req.body
       let sender = await Profile.findById(senderid);
       let receiver = await Profile.findById(receiverid);
      if (!text || !text.trim()) {
       return res.status(400).send("Message cannot be empty");
       }
       if(!sender){
        return res.status(404).send("sender not found")
       }
       if(!receiver){
        return res.status(404).send("receiver not found")
       }
     if (sender.blockedusers.includes(receiverid) ||
         receiver.blockedusers.includes(senderid))
     {
    return res.status(403).send("You cannot message this user.");
     }
    let message= new Directmessage({
        text:text,
        sender:senderid,
        receiver:receiverid
    })
    await message.save()
    let populatedmessage = await Directmessage.findById(message._id)
    .populate({
    path: "sender",
    populate: {
        path: "user",
        select: "username"
    }
     })
     .populate({
    path: "receiver",
    populate: {
        path: "user",
        select: "username"
    }
});    
    const unread = await Directmessage.countDocuments({
                         sender: senderid,
                         receiver: receiverid,
                         isRead: false
                          });
     socket.getIO()
     .to(receiverid)
      .emit(
        "receiveDirectMessage",
         populatedmessage
        );
     socket.getIO()
        .to(receiverid)
        .emit("unreadUpdated", {
          sender: senderid,
           unreadCount: unread
        });
    return res.json(populatedmessage)
   } catch (error) {
      console.log(error)
      return res.status(500).send("internal error")
   }
}

// gettin direct message//
let getdirectmessage = async(req,res)=>{
   try {
    let senderid = req.profileid
     let {receiverid} = req.params
    let message = await Directmessage.find({
        $or:[
            {
                sender:senderid,
                receiver:receiverid
            },
            {
                sender:receiverid,
                receiver:senderid
            }
        ]

    })
    let chatUser = await Profile.findById(receiverid)
     .populate({
    path: "user",
    select: "username"
     })
    .sort({
        createdAt:-1
    })
    return res.json({
    chatUser,
    messages: message
});
   } catch (error) {
    console.log(error)
    return res.status(500).send("internal error")
   }
}
// mark the readed message //
let markmessagesread = async(req,res)=>{
    try{
        let profileid = req.profileid
        let {receiverid} = req.params;
        await Directmessage.updateMany(
        {
            sender:receiverid,
            receiver:profileid,
            isRead:false
        },
        {
            isRead:true
        });
        return res.status(200).send("messages marked as read");
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }

}
// unread count method //
let unreadcount =async(req,res)=>{

    try{
        let  profileid  =req.profileid;
        let result =await Directmessage.aggregate([
        {
            $match:{
                receiver:new mongoose.Types.ObjectId(profileid),
                isRead:false
            }
        },
        {
            $group:{
                _id:"$sender",
                unreadCount:{
                    $sum:1
                }
            }
        }
        ]);
        return res.json(result);
    }
    catch(error){
        console.log(error);
        return res.status(500).send( "internal error");
    }
}

// getting chat list  method//
let getchatlist =async(req,res)=>{
        try{
            let  profileid  =req.profileid;
            let chats =await Directmessage.aggregate([
              {
                 $match:{
                     $or:[
                      {
                        sender:new mongoose.Types.ObjectId(profileid)
                      },
                      {
                        receiver:new mongoose.Types.ObjectId(profileid)
                      }
                    ]
                }
             },
             {
              $sort:{
                   createdAt:-1
                 }
            },
           {
            $group:{
                     _id:{
                      $cond:[
                             {
                             $eq:[
                                 "$sender",new mongoose.Types.ObjectId(profileid)
                                ]
                             },
                             "$receiver",
                             "$sender"
                            ]
                        },
                 latestMessage:{
                   $first:"$text"
                   },
                  latestTime:{
                  $first:"$createdAt"
                 }
             }
         },
         {
            $sort:{
                latestTime:-1
            }
         }
     ]);
     return res.json(chats);
    }
    catch(error){
          console.log(error);
          return res.status(500).send("internal error");
         }
}

// deleting direct message //
let deletemessage = async(req,res)=>{
    try {
        let sender = req.profileid
        let {directmessageid} = req.params
        let dmessage = await Directmessage.findById(directmessageid)
        if(!dmessage){
            return res.status(404).send("message not found")
        }
        if(String(dmessage.sender) !== String(sender) && String(dmessage.receiver) !== String(sender)){
            return res.status(401).send("you can't delete the message")
        }
        await Directmessage.findByIdAndDelete(directmessageid)
        return res.status(200).send("message deleted")
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal error")
    }
}
// edit message in this method message owner can delete the message //
let editmessage = async(req,res)=>{
    try {
        let senderid = req.profileid
        let {dmessageid} = req.params
        let {text} = req.body
        let message = await Directmessage.findById(dmessageid)
        if(!message){
            return res.status(404).send("message not found")
        }
        if(String(senderid) !== String(message.sender)){
            return res.status(401).send("you can't edit it")
        }
        message.text = String(text)
        await message.save()
         return res.json(message.text);
    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal error")
    }
}
module.exports={senddirectmessage,getdirectmessage,markmessagesread,unreadcount,getchatlist,deletemessage,editmessage}