require("dotenv").config();
require("./config/db")
let express = require("express")

let app= express();
let http = require("http");
let server = http.createServer(app);
let {Server} = require("socket.io")
let io = new Server(server,{
    cors:{
        origin:"*"
    }
})
let socket = require("./socket/socket");
const { profile } = require("console");
socket.init(io)

app.use(express.json())
app.use("/",express.static("uploads"))
app.use("/users",require("../sample_socialmedia_project/routes/userroutes"))
app.use("/profile ",require("../sample_socialmedia_project/routes/profileroutes"))
app.use("/uploads",express.static("uploads"))
app.use("/friend",require("../sample_socialmedia_project/routes/profileroutes"))
app.use("/",require("../sample_socialmedia_project/routes/postroutes"))
app.use("/",require("../sample_socialmedia_project/routes/grouproutes"))
app.use("/",require("../sample_socialmedia_project/routes/messageroutes"))
app.use("/",require("../sample_socialmedia_project/routes/messageroutes"))
app.use("/",require("../sample_socialmedia_project/routes/directmessageroutes"))

io.on("connection",(socket)=>{
    console.log("user connected")
    socket.on(
        "joingroup",
        (groupid)=>{
            socket.join(groupid)
        }
    )
    socket.on(
        "joinprofile",
        (profileid)=>{
            socket.join(profileid)
            console.log("joinedprofile",profileid)
        }

    )
})


server.listen(process.env.PORT,()=>{
    console.log("server started");
})