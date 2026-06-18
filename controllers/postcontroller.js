let Post = require("../models/post")
let Profile = require("../models/profile")
let User = require("../models/user")

// post creation //

let createpost = async(req,res)=>{
    try {
        let {profileid} = req.params
        let {caption}=req.body

        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.send("profile not found")
        }        
        let post = new Post({
            caption:caption,
            media:req.file?
            req.file.path:"",
            profile:profileid
        })
        await post.save();
        return res.json(post);
    } catch (error) {
        console.log(error)
        return res.send("internal error");
    }
}


// post getting to the connected user //
let getfeed = async(req,res)=>{
    try {
    let {profileid} = req.params
    let profile = await Profile.findById(profileid)
        if(!profile){
            return res.send("profile not found")
        }  
        let posts = await Post.find({
            profile:{
                $in:[...profile.connections,
                    profile._id
                ]
            }
        })
        .populate({
            path:"profile",
            populate:{
                path:"user"
            }
        })
        .sort(
            {
                createdAt:-1
            }
        )
      return res.json(posts);
} catch (error) {
    console.log(error)
    return res.send("internal error")
}
}
// post likes //

let likes = async(req,res)=>{
    try {
        let {postid,profileid} = req.params

        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.send("profile not found")
        }
         let post = await Post.findById(postid)
        if(!post){
            return res.send("post not found")
        }
        if(post.likes.includes(profileid)){
            return res.send("already liked")
        }
        post.likes.push(profileid)
        await post.save();
        return res.json({
            message:"liked",
            totallikes:post.likes.length
    })

    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}

// unlike post //

let unlike = async(req,res)=>{
    try {
        let {postid,profileid} = req.params
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.send("profile not found")
        }
        let post = await Post.findById(postid)
        if(!post){
            return res.send("post not found")
        }
        post.likes = post.likes.filter(
            like=> like.toString() !== profileid
        )
        await post.save();
        return res.json({
            message:"unlike",
            totallikes:post.likes.length
        })
        
    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}

let getpost = async(req,res)=>{
    try {
        let {username} = req.query;
         if(!username){
            return res.send("username required")
        }
        let user =  await User.findOne({
            username:{
                $regex:username,
                $options:"i"
            }
        });
       
        if(!user){
            return res.send("user not found")
        }
        let profile = await Profile.findOne({
            user:user._id
        })
        if(!profile){
            return res.send("profile not created")
        }
        let post = await Post.find({
            profile:profile._id
        })
        .populate({
            path:"profile",
            populate:{
                path:"user"
            }
        })
        .sort({
            createdAt:-1
        });
        return res.json(post);

    } catch (error) {
        console.log(error)
        return res.send("internal error")
    }
}


module.exports= {createpost,getfeed,likes,unlike,getpost}