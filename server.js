require("dotenv").config();
require("./config/db");
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
// Socket Configuration
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        credentials: true
    }
});

const socket = require("./socket/socket");
 
socket.init(io);
 
 
// Middlewares
 
app.use(
    cors({
        origin:"*",
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        credentials: true
    })
);
 
 
app.use(express.json());
 

// Routes
 
app.use("/user",require("./routes/userroutes"));
app.use("/profile",require("./routes/profileroutes"));
app.use("/post",require("./routes/postroutes"));
app.use("/group",require("./routes/grouproutes"));
app.use("/message",require("./routes/messageroutes"));
app.use("/dmessage",require("./routes/directmessageroutes"));
app.use("/connection",require("./routes/connectionrequestroutes"))
app.use("/mainlist",require("./routes/chatroutes"))
app.use("/notification",require("./routes/notificationroutes"))
app.use("/activity",require("./routes/activityroutes"))

// Socket Connection
 
io.on(
    "connection",
    (socket)=>{
        console.log("User connected:",socket.id);
        socket.on("joingroup",
            (groupid)=>{
               try {
                 socket.join(groupid);
                console.log("Joined group:",groupid);
               } catch (error) {
                console.log(error);
               }
 
            }
        );
 
        socket.on("joinprofile",(profileid)=>{
         try {
            socket.join(profileid);
            console.log("Joined profile:",profileid);
         } catch (error) {
            console.log(error)
         }
 
            }
        );
 
 
        socket.on("disconnect",()=>{
           console.log("User disconnected:",socket.id);
 
            }
        );
 
    }
);
 
 
// Start Server

const PORT =process.env.PORT;
server.listen(
    PORT,
    ()=>{
        console.log(`Server running on port ${PORT}`);
    }
);