const mongoose = require("mongoose");

const AllocationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            unique: true,
            required: true
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "room",
            required: true
        }
    },
    {
        timestamps: true
    }
);

AllocationSchema.pre(/^save|^find/, function (next) {
    this.populate("user", "id name customIdentifier");
    this.populate("room", "id roomNumber hostelName capacity currentOccupancy");
    next();
});

module.exports = mongoose.model("allocation", AllocationSchema);
