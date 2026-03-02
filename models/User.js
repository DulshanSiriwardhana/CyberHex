import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema.Types({
    name:{
        type: String,
        require: true,
        unique: true
    }
});

export const User = mongoose.model("User", UserSchema);