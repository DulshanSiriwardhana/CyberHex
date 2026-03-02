import mongoose from "mongoose";

mongoose.connect(process.env.DB_URI, {
    userNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((error)=>{
    console.error("Error connecting to MongoDB:", error);
});

export default mongoose;