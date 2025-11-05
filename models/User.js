import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{type:String, required:true},
        phone:{type:Number, required:true},
        email:{type:String, required:true, unique:true},
        password:{type:String, required:true},
        role:{
            type:String,
            enum:["user","admin","caddy","starter"],
            default:"user"
        },
        img:{ type: String, default: null }
    }
);

const User = mongoose.model("User", userSchema);
export default User;