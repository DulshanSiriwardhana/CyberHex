import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerified: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model("User", UserSchema);