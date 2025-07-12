"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sqlConfig_1 = require("../config/sqlConfig");
const mssql_1 = __importDefault(require("mssql"));
// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                error: "Authorization header is missing"
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: "Token is missing"
            });
        }
        try {
            const data = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            req.info = data;
            // Add a check for isActive
            let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
            let user = (await pool.request()
                .input("id", data.id)
                .query("SELECT isActive FROM users WHERE id = @id")).recordset[0];
            if (!user.isActive) {
                return res.status(401).json({
                    error: "User is not active"
                });
            }
            next();
        }
        catch (err) {
            return res.status(401).json({
                error: "Invalid or expired token"
            });
        }
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({
            error: "Authentication failed"
        });
    }
};
exports.verifyToken = verifyToken;
