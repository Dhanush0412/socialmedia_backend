
let Connectionrequest = require("../models/connectionrequest")
let Profile = require("../models/profile")
let Notification = require("../models/notification")

// send request //

let sendrequest = async (req,res)=>{
    try {
        let senderid = req.profileid;
        let {receiverid}= req.body;
        if(senderid == receiverid){
            return res.send("cannot send request to yourself")
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
            return res.send("already request sent")
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
        return res.send("request sent")

    } catch (error) {
        console.log(error)
        return res.send("internal error")
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
        .populate("sender")
        return res.json(requests)
    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}

// accept request //

let acceptrequest = async(req,res)=>{
    try {
        let {requestid} = req.params;
        let request = await Connectionrequest.findById(requestid)
        if(!request){
            return res.send("request not found")
        }
         if(String(request.receiver)!== String(req.profileid)){
           return res.send("unauthorized");
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
        return res.send("request accepted")
         
    } catch (error) {
       console.log(error)
       return res.send("internal error")   
    }
}

// reject request //
 let rejectrequest = async(req,res)=>{
    try {
        let {requestid} = req.params
         let request = await Connectionrequest.findById(requestid)
        if(!request){
            return res.send("request not found")
        }
         if(String(request.receiver)!== String(req.profileid)){
           return res.send("unauthorized");
         }
        request.status="rejected"
        await request.save();
        return res.send("request rejected")
    } catch (error) {
        console.log(error)
        return res.send("internal error")
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
        return res.send("internal error")
    }
 }

 module.exports={sendrequest,pendingrequest,acceptrequest,rejectrequest,getconnections}