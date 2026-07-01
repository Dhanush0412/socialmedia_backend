let Activity = require("../models/activity")

let updatedactivity = async(req,res)=>{
    try {
        let profileid = req.profileid
        let {seconds} = req.body
        if(seconds<0){
            return res.status(400).send("invalid time")
        }
        let today = new Date().toISOString().split("T")[0];
        let activity = await Activity.findOne({
            profile:profileid,
            date:today
        })
        if(!activity){
            activity = new Activity({
                profile:profileid,
                date:today,
                totalseconds:seconds
            })
        }
        else{
            activity.totalseconds += seconds;
        }
        await activity.save()
        return res.status(200).send("activity updated")
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

module.exports=updatedactivity