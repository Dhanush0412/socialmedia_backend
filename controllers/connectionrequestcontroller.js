
let Connectionrequest = require("../models/connectionrequest")
let Profile = require("../models/profile")
let Notification = require("../models/notification")

// send request //

let sendrequest = async (req,res)=>{
    try {
        let senderid = req.profileid;
        let {receiverid}= req.params;
        if(senderid == receiverid){
            return res.status(403).send("cannot send request to yourself")
        }
         let senderProfile = await Profile.findById(senderid);
         let receiverProfile = await Profile.findById(receiverid);

          if (senderProfile.blockedusers.includes(receiverid) ||receiverProfile.blockedusers.includes(senderid)) 
            {
              return res.status(403).send("You cannot send a connection request.");
             }
           if(senderProfile.connections.includes(receiverid)){
            return res.status(429).send("you already connected with him")
           }
        let requestexist = await Connectionrequest.findOne({
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

      });
        if(requestexist){
            return res.status(429).send("already request sent")
        }
        let request = new Connectionrequest({
            sender:senderid,
            receiver:receiverid
        })
        await request.save();
        await Notification.create({
         receiverid:receiverid,
         senderid:senderid,
         type:"connectionrequest",
         message:"sent you a connection request"

          });
          
        return res.status(200).send("request sent")

    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// pending request //

let pendingrequest = async(req,res)=>{
    try {
        let profileid = req.profileid;
        let requests = await Connectionrequest.find({
            receiver:profileid,
            status:"pending"
        })
         .populate({
            path:"sender",
             select:"profilepic user",
             populate:{
              path:"user",
             select:"username"
              }
           })
        return res.json(requests)
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// accept request //

let acceptrequest = async(req,res)=>{
    try {
        let {requestid} = req.params;
        let request = await Connectionrequest.findById(requestid)
        if(!request){
            return res.status(404).send("request not found")
        }
         if(String(request.receiver)!== String(req.profileid)){
           return res.status(401).send("unauthorized");
         }
         if(request.status=="accepted"){
            return res.status(429).send("you already accept the request")
         }
         if(request.status=="rejected"){
            return res.status(429).send("already you rejected the request")
         }
        request.status="accepted"
        await request.save();
        await Notification.create({

         receiverid:request.sender,
         senderid:request.receiver,
         type:"connectionaccepted",
         message:"accepted your connection request"
         });

        let senderprofile = await Profile.findById(request.sender)
        let receiverprofile = await Profile.findById(request.receiver)
        receiverprofile.connections.push(senderprofile._id)
        senderprofile.connections.push(receiverprofile._id)
        await senderprofile.save();
        await receiverprofile.save();
        return res.status(200).send("request accepted")
         
    } catch (error) {
       console.log(error)
       return res.status(500).send("internal error")   
    }
}

// reject request //
 let rejectrequest = async(req,res)=>{
    try {
        let {requestid} = req.params
         let request = await Connectionrequest.findById(requestid)
        if(!request){
            return res.status(404).send("request not found")
        }
         if(String(request.receiver)!== String(req.profileid)){
           return res.status(403).send("unauthorized");
         }
         if(request.status == "accepted"){
            return res.status(429).send("you already accept")
         }
        request.status="rejected"
        await request.save();
        return res.status(200).send("request rejected")
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
 }
 // get connections //
 let getconnections = async (req,res)=>{
    try {
        let profileid = req.profileid;
        let profile = await Profile.findById(profileid)
        .populate({
            path:"connections",
         populate:{
            path:"user"
         }
        })
        return res.json(profile.connections);

    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
 }

 // block user //
 let blockuser = async(req,res)=>{
    try {
        let myprofileid = req.profileid
        let {blockprofileid} = req.params
        if(String(myprofileid)===String(blockprofileid)){
            return res.status(403).send("You can't block yourself")
        }
        let myprofile = await Profile.findById(myprofileid)
        let targetprofile = await Profile.findById(blockprofileid)
        if(!targetprofile){
            return res.status(404).send("Profile not found")
        }
        if(myprofile.blockedusers.includes(blockprofileid)){
            return res.status(429).send("user already blocked")
        }
        myprofile.connections = myprofile.connections.filter(
            id=>String(id) !== String(blockprofileid)
        )

        targetprofile.connections = targetprofile.connections.filter(
            id=>String(id) !== String(myprofileid)
        )
         await Connectionrequest.deleteMany({
            $or:[
                {
                    sender:myprofileid,
                    receiver:blockprofileid
                },
                {
                    sender:blockprofileid,
                    receiver:myprofileid
                }
            ]
         })
          myprofile.blockedusers.push(blockprofileid);
        await myprofile.save();
        await targetprofile.save();
        return res.status(200).send("User blocked");
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server error")
    }
 }


// unblock user //

let unblockuser = async(req,res)=>{
    try{
        let myprofileid=req.profileid;
        let {unblockprofileid}=req.params;
        let myprofile=await Profile.findById(myprofileid);
        myprofile.blockedusers=
        myprofile.blockedusers.filter(
            id=>String(id)!==String(unblockprofileid)
        );
        await myprofile.save();
        return res.status(200).send("User unblocked");
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }

}

// getting blocked user // 

let blockedusers = async(req,res)=>{

    try{
        let profile = await Profile.findById(req.profileid)
        .populate({
            path:"blockedusers",
            populate:{
                path:"user"
            }
        });
        return res.json(profile.blockedusers);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }
}

 module.exports={sendrequest,pendingrequest,acceptrequest,rejectrequest,getconnections,blockuser,unblockuser,blockedusers}