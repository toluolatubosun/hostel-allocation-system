const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const { JWT_SECRET } = require("../config");
const User = require("../models/user.model");
const response = require("../utils/response");
const CustomError = require("../utils/custom-error");

router.post("/register", async (req, res) => {
    // Check if all fields are filled
    if (!req.body.name) throw new CustomError("name is required", 400);
    if (!req.body.gender) throw new CustomError("gender is required", 400);
    if (!req.body.password) throw new CustomError("password is required", 400);
    if (!req.body.customIdentifier) throw new CustomError("email or matriculation number or staff Id is required", 400);

    const user = await User.findOne({ customIdentifier: req.body.customIdentifier });
    if (user) throw new CustomError("User already exists", 400);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user
    const newUser = new User({
        name: req.body.name,
        gender: req.body.gender,
        password: hashedPassword,
        role: req.body.role || "student",
        customIdentifier: req.body.customIdentifier
    });

    // Save user to database
    const savedUser = await newUser.save();

    res.status(200).json(response("User created successfully", savedUser, true));
});

router.post("/login", async (req, res) => {
    // Check if all fields are filled
    if (!req.body.password) throw new CustomError("password is required", 400);
    if (!req.body.customIdentifier) throw new CustomError("matriculation Number is required", 400);

    // Get user from database
    const user = await User.findOne({ customIdentifier: req.body.customIdentifier });
    if (!user) throw new CustomError("User does not exist", 400);

    // Check if password is correct
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) throw new CustomError("Incorrect password", 400);

    // Create and assign token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

    res.status(200).json(response("Login successful", { token, user }, true));
});

module.exports = router;
