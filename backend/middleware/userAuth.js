const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};
