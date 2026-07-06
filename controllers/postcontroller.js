let Post = require("../models/post")
let Profile = require("../models/profile")
let User = require("../models/user")
let Notification = require("../models/notification")
let Comment = require("../models/comment")
// post creation //

let createpost = async(req,res)=>{
    try {
        let profileid = req.profileid
        let {caption,status="draft"}=req.body
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile not found")
        }      
        let post = new Post({
            caption:caption,
            status:status,
            media:req.file?
            req.file.path:"",
            profile:profileid
        })
        await post.save();
        return res.json(post);
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error");
    }
}

// post getting to the connected user //
let getfeed = async(req,res)=>{
    try {
    let profileid = req.profileid
    let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile not found")
        }  
        let posts = await Post.find({
            profile:{
                $in:[...profile.connections,
                    profile._id
                ]
            },
            status:"published"
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
    return res.status(500).send("internal error")
  }
}
// post likes //

let likes = async(req,res)=>{
    try {
        let profileid=req.profileid
        let {postid} = req.params

        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(400).send("profile not found")
        }
         let post = await Post.findById(postid)
        if(!post){
            return res.status(400).send("post not found")
        }
        if(post.likes.includes(profileid)){
            return res.status(429).send("already liked")
        }
        post.likes.push(profileid)
        await post.save();
        
        if(post.profile.toString()!==profileid)
         {
            await Notification.create({
            receiverid:post.profile,
            senderid:profileid,
            type:"like",
            message:"liked your post"
            });
         }
        return res.json({
            message:"liked",
            totallikes:post.likes.length
    })

    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// unlike post //

let unlike = async(req,res)=>{
    try {
        let profileid=req.profileid
        let {postid} = req.params
        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile not found")
        }
        let post = await Post.findById(postid)
        if(!post){
            return res.status(404).send("post not found")
        }
        post.likes = post.likes.filter(
            like=> like.toString() !== profileid.toString()
        )
        await post.save();
        return res.json({
            message:"unlike",
            totallikes:post.likes.length
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// adding comments method //

let addcomment = async (req,res)=>{
    try {
        let profileid = req.profileid
        let {postid} = req.params
        let {text} = req.body

        let profile = await Profile.findById(profileid)
        if(!profile){
            return res.status(404).send("profile not found")
        }
        let post = await Post.findById(postid)
        if(!post){
            return res.status(404).send("post not found")
        }
        if(!text || text.trim() ==""){
            return res.send("comment required to send")
        }
        let comment = new Comment({
            text:text,
            profile:profileid,
            post:postid
        })
        await comment.save();       
         if(post.profile.toString()!=profileid){
            await Notification.create({
                receiverid:post.profile,
                senderid:profileid,
                type:"comment",
                message:"commented on your post"
            })

        }
        let result = await Comment.findById(comment._id)
        .populate({
            path:"profile",
            populate:{
                path:"user"
            }
        })
        return res.json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// getting comments //

let getcomments = async(req,res)=>{
    try {
         let { postid } = req.params
        let comments = await Comment.find({post:postid})
        .populate({
            path:"profile",
            populate:{
                path:"user"
            }
        })
        .sort({
            createdAt:-1
        })
        return res.json(comments)
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal error")
    }
}

// deleting comment (post creater can delete) //

let deletecomment = async(req,res)=>{
    try {
        let profileid = req.profileid
        let {commentid} = req.params
        let comment = await Comment.findById(commentid)
        if(!comment){
           return res.status(404).send("comment not found") 
        }
        let post = await Post.findById(comment.post);
        if(String(post.profile) !== String(profileid) && String(comment.profile) !== String(profileid)){
            return res.status(401).send("unauthorized")
        }
        await Comment.findByIdAndDelete(commentid)
        return res.status(204).send("comment deleted")
    } catch (error) {
        console.log(error)
        return res.status(500).send("intenal error")
    }
}

// getting particular profile post //
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
            return res.status(404).send("user not found")
        }
        let profile = await Profile.findOne({
            user:user._id
        })
        if(!profile){
            return res.status(404).send("profile not found")
        }
        let post = await Post.find({
            profile:profile._id,
            status:"published"
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
        return res.status(500).send("internal error")
    }
}
 // getting my post //
   let getmyposts = async(req,res)=>{

    try{
        let  profileid  = req.profileid
        let profile = await Profile.findById(profileid);
        if(!profile){
            return res.status(404).send("profile not found");
        }
        let posts = await Post.find({profile:profileid})
        .populate({
            path:"profile",
            populate:{
                path:"user"
            }
        })

        .sort({
            createdAt:-1
        });
        return res.json(posts);

    }
    catch(error){
        console.log(error);
        return res.status(500).send("internal error");
    }
}

module.exports= {createpost,getfeed,likes,unlike,addcomment,getcomments,deletecomment,getpost,getmyposts}