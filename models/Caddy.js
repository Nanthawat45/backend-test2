import mongoose from "mongoose";

const caddySchema = new mongoose.Schema({
    caddy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // แต่ละ User จะเป็น Caddy ได้แค่ครั้งเดียว
    },
    name:{
        type: String, required: true
    },
    caddyStatus: {
        type: String,
        enum: ['available', 'booked', 'onGoing', 'clean', 'resting', 'unavailable'],
        default: 'available',
    },
})

const Caddy = mongoose.model("Caddy", caddySchema);
export default Caddy;