require("dotenv").config();

let mongoose = require("mongoose");

mongoose.connect(
    process.env.MONGO_URL
)
.then(()=>{
    console.log("mongodb connected");
})
.catch((error)=>{
    console.log(error);
});