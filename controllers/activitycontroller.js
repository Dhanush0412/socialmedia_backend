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

let getactivity = async (req, res) => {
    try {
        let profileid = req.profileid;
        let activity = await Activity.find({
            profile: profileid
        })
        .sort({
            date: -1
        });
        if (activity.length === 0) {
            return res.json([]);
        }
        let result = activity.map(item => {
            let hours = Math.floor(
                item.totalseconds / 3600
            );
            let minutes = Math.floor(
                (item.totalseconds % 3600) / 60
            );
            return {
                date: new Date(item.date)
                    .toLocaleDateString("en-GB"),
                duration: `${hours}h ${minutes}m`,
                totalSeconds: item.totalseconds
            };
        });

        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Error");
    }
};
module.exports={updatedactivity,getactivity}