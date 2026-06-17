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
socket.init(io)

app.use(express.json())
app.use("/user",require("./routes/userroutes"))
app.use("/profile",require("./routes/profileroutes"))
app.use("/uploads",express.static("uploads"))
app.use("/friend",require("./routes/profileroutes"))
app.use("/connect",require("./routes/connectionrequestroutes"))
app.use("/getting",require("./routes/chatroutes"))
app.use("/post",require("./routes/postroutes"))
app.use("/group",require("./routes/grouproutes"))
app.use("/message",require("./routes/messageroutes"))
app.use("/directmessage",require("./routes/directmessageroutes"))

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