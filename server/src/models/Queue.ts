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
    }
}, {
    timestamps: true
});

export default mongoose.model("Queue", queueSchema);