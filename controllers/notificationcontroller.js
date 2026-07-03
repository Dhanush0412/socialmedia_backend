let Notification = require("../models/notification")
let Profile = require("../models/profile")
// get notification method //
let getnotifications = async(req,res)=>{
      try{
        let  profileid  = req.profileid;
        let notifications =await Notification.find({receiverid:profileid})
        .populate("senderid")
        .sort({
            createdAt:-1
        });
        return res.json(notifications);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }

}

// mark the readed message //
let markasread = async(req,res)=>{

    try{
        let { notificationid } =req.params;
        let notification =await Notification.findById(notificationid);
        if(!notification){
            return res.status(404).send("notification not found");
        }
        if(String(notification.receiverid)!== String(req.profileid)){
           return res.status(401).send("unauthorized");
         }
        notification.read = true;
        await notification.save();
        return res.json({
            message:"notification marked as read",
            notification
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");

    }

}

module.exports={getnotifications,markasread}