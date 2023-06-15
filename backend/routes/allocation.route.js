const router = require("express").Router();

const User = require("../models/user.model");
const Room = require("../models/room.model");
const Allocation = require("../models/allocation.model");

const { role } = require("../config");
const response = require("../utils/response");
const CustomError = require("../utils/custom-error");
const auth = require("../middlewares/auth.middleware");
const { HOSTEL_NAMES_GENDER } = require("../utils/hostel-data");

router.post("/allocate-room-auto", auth(role.ADMIN), async (req, res) => {
    if (!req.body.user) throw new CustomError("userId is required", 400);

    const user = await User.findOne({ _id: req.body.user });
    if (!user) throw new CustomError("User does not exist", 400);

    const allocationsCount = await Allocation.countDocuments({ user: req.body.user });
    if (allocationsCount > 0) throw new CustomError("User already has a room", 400);

    // Possible hostels based on the user's gender
    const possibleHostels = HOSTEL_NAMES_GENDER.map((hostel) => {
        if (hostel.gender === user.gender) return hostel.name;
    });

    // Get one room from the possible hostels that is not full ( currentOccupancy < capacity )
    const result = await Room.aggregate([
        { $match: { hostelName: { $in: possibleHostels }, $expr: { $lt: ["$currentOccupancy", "$capacity"] } } },
        { $sort: { hostelName: 1, roomNumber: 1 } },
        { $limit: 1 }
    ]);
    if (result.length === 0) throw new CustomError("No rooms available", 400);

    const room = result[0];
    const allocation = await new Allocation({ user: req.body.user, room: room._id }).save();
    await Room.updateOne({ _id: room._id }, { $inc: { currentOccupancy: 1 } });

    res.status(200).json(response("Room allocated successfully", allocation, true));
});

router.post("/allocate-room", auth(role.ADMIN), async (req, res) => {
    if (!req.body.user) throw new CustomError("userId is required", 400);
    if (!req.body.room) throw new CustomError("roomId is required", 400);

    const room = await Room.findOne({ _id: req.body.room });
    if (!room) throw new CustomError("Room does not exist", 400);

    const allocationsCount = await Allocation.countDocuments({ room: req.body.room });
    if (allocationsCount >= room.capacity) throw new CustomError("Room is full", 400);

    const allocation = await new Allocation({ user: req.body.user, room: req.body.room }).save();
    await Room.updateOne({ _id: req.body.room }, { $inc: { currentOccupancy: 1 } });

    res.status(200).json(response("Room allocated successfully", allocation, true));
});

router.get("/all", auth(role.ADMIN), async (req, res) => {
    const allocations = await Allocation.find();
    res.status(200).json(response("Allocations retrieved successfully", allocations, true));
});

router.get("/all/:hostelName", auth(role.ADMIN), async (req, res) => {
    const allocations = await Allocation.find({ hostelName: req.params.hostelName });
    res.status(200).json(response("Allocations retrieved successfully", allocations, true));
});

router.get("/:id", auth(role.ADMIN), async (req, res) => {
    const allocation = await Allocation.findOne({ _id: req.params.id });
    res.status(200).json(response("Allocation retrieved successfully", allocation, true));
});

router.get("/user/:id", auth(role.ADMIN), async (req, res) => {
    const allocation = await Allocation.findOne({ user: req.params.id });
    res.status(200).json(response("Allocation retrieved successfully", allocation, true));
});

router.delete("/all", auth(role.ADMIN), async (req, res) => {
    const allocations = await Allocation.deleteMany();
    await Room.updateMany({}, { $set: { currentOccupancy: 0 } });

    res.status(200).json(response("Allocations deleted successfully", allocations, true));
});

router.delete("/:id", auth(role.ADMIN), async (req, res) => {
    const allocation = await Allocation.findOne({ _id: req.params.id });
    if (!allocation) throw new CustomError("Allocation does not exist", 400);

    await Allocation.deleteOne({ _id: req.params.id });
    await Room.updateOne({ _id: allocation.room }, { $inc: { currentOccupancy: -1 } });

    res.status(200).json(response("Allocation deleted successfully", allocation, true));
});

module.exports = router;
