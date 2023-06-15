const JWT = require("jsonwebtoken");
const User = require("../models/user.model");
const { JWT_SECRET } = require("../config");
const CustomError = require("../utils/custom-error");

/**
 * If no role is passed the default role is user
 *
 * @param  {any[]} roles List of roles allowed to access the route
 */

function auth(roles = []) {
    return async (req, res, next) => {
        // Check if token is present
        if (!req.headers.authorization) throw new CustomError("unauthorized access: Token not found", 401);

        // Get token from header
        const token = req.headers.authorization.split(" ")[1];
        const decoded = JWT.verify(token, JWT_SECRET);

        // Check if user exists
        const user = await User.findOne({ _id: decoded.id });

        // Check if user is allowed to access the route
        if (!user) throw new CustomError("unauthorized access: User does not exist", 401);
        if (!roles.includes(user.role)) throw new CustomError("unauthorized access", 401);

        req.$user = user;

        next();
    };
}

module.exports = auth;
