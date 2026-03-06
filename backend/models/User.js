import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema.Types({
    name:{
        type: String,
        require: true,
        unique: true
    },
    profilePicture:{
        type: String,
        require: false
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        require: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

export const User = mongoose.model("User", UserSchema);