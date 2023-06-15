const router = require("express").Router();

const Room = require("../models/room.model");

const { role } = require("../config");
const response = require("../utils/response");
const { HOSTEL_NAMES } = require("../utils/hostel-data");
const CustomError = require("../utils/custom-error");
const auth = require("../middlewares/auth.middleware");

router.post("/create", auth(role.ADMIN), async (req, res) => {
    if (!req.body.capacity) throw new CustomError("capacity is required", 400);
    if (!req.body.roomNumber) throw new CustomError("roomNumber is required", 400);
    if (!req.body.hostelName) throw new CustomError("hostelName is required", 400);

    if (!HOSTEL_NAMES.includes(req.body.hostelName)) throw new CustomError("hostelName is invalid", 400);

    const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber, hostelName: req.body.hostelName });
    if (existingRoom) throw new CustomError("Room already exists", 400);

    const newRoom = await new Room({ roomNumber: req.body.roomNumber, hostelName: req.body.hostelName, capacity: req.body.capacity }).save();

    res.status(200).json(response("Room created successfully", newRoom, true));
});

router.get("/all", auth(role.ADMIN), async (req, res) => {
    const rooms = await Room.find().sort({ hostelName: 1, roomNumber: 1 });
    res.status(200).json(response("Rooms retrieved successfully", rooms, true));
});

router.get("/all/available", auth(role.ADMIN), async (req, res) => {
    const rooms = await Room.aggregate([{ $match: { $expr: { $lt: ["$currentOccupancy", "$capacity"] } } }, { $sort: { hostelName: 1, roomNumber: 1 } }]);
    res.status(200).json(response("Rooms retrieved successfully", rooms, true));
});

router.get("/all/:hostelName", auth(role.ADMIN), async (req, res) => {
    const rooms = await Room.find({ hostelName: req.params.hostelName }).sort({ roomNumber: 1 });
    res.status(200).json(response("Rooms retrieved successfully", rooms, true));
});

router.get("/all/available/:hostelName", auth(role.ADMIN), async (req, res) => {
    const rooms = await Room.aggregate([{ $match: { hostelName: req.params.hostelName, $expr: { $lt: ["$currentOccupancy", "$capacity"] } } }, { $sort: { roomNumber: 1 } }]);
    res.status(200).json(response("Rooms retrieved successfully", rooms, true));
});

router.get("/:id", auth(role.ADMIN), async (req, res) => {
    const room = await Room.findOne({ _id: req.params.id });
    res.status(200).json(response("Room retrieved successfully", room, true));
});

router.put("/:id", auth(role.ADMIN), async (req, res) => {
    if (!req.body.capacity) throw new CustomError("capacity is required", 400);

    const room = await Room.findOne({ _id: req.params.id });
    if (!room) throw new CustomError("Room does not exist", 400);

    const updatedRoom = await Room.findOneAndUpdate({ _id: req.params.id }, { capacity: req.body.capacity }, { new: true });

    res.status(200).json(response("Room updated successfully", updatedRoom, true));
});

router.delete("/:id", auth(role.ADMIN), async (req, res) => {
    const room = await Room.findOne({ _id: req.params.id });
    if (!room) throw new CustomError("Room does not exist", 400);

    await Room.findOneAndDelete({ _id: req.params.id });

    res.status(200).json(response("Room deleted successfully", room, true));
});

module.exports = router;
