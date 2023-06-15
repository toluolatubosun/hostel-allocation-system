const mongoose = require("mongoose");
const { HOSTEL_NAMES } = require("../utils/hostel-data");

const RoomSchema = new mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true
        },
        hostelName: {
            type: String,
            required: true,
            enum: HOSTEL_NAMES
        },
        capacity: {
            type: Number,
            required: true
        },
        currentOccupancy: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

RoomSchema.index({ roomNumber: 1, hostelName: 1 }, { unique: true });

module.exports = mongoose.model("room", RoomSchema);
