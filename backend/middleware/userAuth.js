const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "donation_secret_key");
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ error: "Invalid token." });
    }
};
