const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        // Email or Matriculation Number or Staff ID
        customIdentifier: {
            type: String,
            unique: true,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ["student", "admin"]
        },
        gender: {
            type: String,
            required: true,
            enum: ["M", "F"]
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("user", UserSchema);
