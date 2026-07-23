import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        required: true  
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    waitingTime: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model("Queue", queueSchema);