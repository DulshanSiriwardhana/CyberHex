import mongoose from "mongoose";

const DBinitialize = () => {
    mongoose.connect(process.env.DB_URI)
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((error)=>{
        console.error("Error connecting to MongoDB:", error);
    });
}


export default DBinitialize;