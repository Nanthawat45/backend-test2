import mongoose from "mongoose";

const STATUS_ENUM = [
  "booked", 
  "inUse", 
  "clean", 
  "available", 
  "spare", 
  "broken"
];

const TYPE_ENUM = [
    "golfCar", 
    "golfBag"
];
const itemSchema = new mongoose.Schema({ 
   itemId: { 
        type: String,
        required: true,
        unique: true, 
        trim: true,
    },
    description: {
        type: String,
        trim: true, 
    },
  type: { 
    type: String, 
    enum: TYPE_ENUM,
    required: true 
  },
  status: { 
    type: String, 
    enum: STATUS_ENUM,
    default: "available", 
    required: true
  }
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
export default Item;