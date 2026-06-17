const { default: mongoose } = require("mongoose")
let Directmessage=require("../models/directmessage")
let socket = require("../socket/socket")
let senddirectmessage = async(req,res)=>{
   try {
       let {text,senderid,receiverid} = req.body
    let message= new Directmessage({
        text:text,
        sender:senderid,
        receiver:receiverid
    })
    await message.save()
    let populatedmessage = await Directmessage.findById(message._id)
    .populate("sender")
    .populate("receiver")
    
    socket.getIO()

.to(receiverid)

.emit(
    "receiveDirectMessage",
    populatedmessage
);

    return res.json(populatedmessage)
   } catch (error) {
      console.log(error)
      return res.send("internal error")
   }
}


let getdirectmessage = async(req,res)=>{
   try {
     let {senderid,receiverid} = req.params
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
    .populate("sender")
    .populate("receiver")
    .sort({
        createdAt:-1
    })
    return res.json(message)
   } catch (error) {
    console.log(error)
    return res.send("internal error")
   }
}
let markmessagesread = async(req,res)=>{

    try{

        let {
            senderid,
            receiverid
        } = req.params;

        await Directmessage.updateMany(

        {

            sender:senderid,

            receiver:receiverid,

            isRead:false

        },

        {

            isRead:true

        }

        );

        return res.send(
            "messages marked as read"
        );

    }

    catch(error){

        console.log(error);

        return res.send(
            "internal error"
        );

    }

}
let unreadcount =async(req,res)=>{

    try{

        let { profileid } =
        req.params;

        let result =
        await Directmessage.aggregate([

        {

            $match:{

                receiver:
                new mongoose.Types.ObjectId(
                    profileid
                ),

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

        return res.json(
            result
        );

    }

    catch(error){

        console.log(error);

        return res.send( "internal error");

    }

}

let getchatlist =async(req,res)=>{

try{

let { profileid } =req.params;

let chats =await Directmessage.aggregate([

{
    $match:{

        $or:[

        {
            sender:
            new mongoose.Types.ObjectId(profileid)
        },

        {
            receiver:
            new mongoose.Types.ObjectId(profileid)
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
                        "$sender",
                        new mongoose.Types.ObjectId(
                            profileid
                        )
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

return res.send(
    "internal error"
);

}

}

let chatpreview = async(req,res)=>{

try{

let { profileid } = req.params;

let result =
await Directmessage.aggregate([

{
    $match:{

        $or:[

            {
                sender:
                new mongoose.Types.ObjectId(
                    profileid
                )
            },

            {
                receiver:
                new mongoose.Types.ObjectId(
                    profileid
                )
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
                        "$sender",
                        new mongoose.Types.ObjectId(
                            profileid
                        )
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
    $lookup:{

        from:"profiles",

        localField:"_id",

        foreignField:"_id",

        as:"friend"

    }

},

{
    $unwind:"$friend"
},

{
    $project:{

        friendid:"$friend._id",

        profilepic:"$friend.profilepic",

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

return res.send("internal error");

}

}


module.exports={senddirectmessage,getdirectmessage,markmessagesread,unreadcount,getchatlist,chatpreview}