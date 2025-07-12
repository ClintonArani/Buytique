"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sqlConfig_1 = require("../config/sqlConfig");
class authService {
    async login(logins) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let user = (await pool.request()
            .input("email", logins.email)
            .input("password", logins.password)
            .execute("loginUser")).recordset;
        if (user.length < 1) {
            return {
                error: "User not found"
            };
        }
        else {
            let hashedPassword = user[0].password;
            // Compare password
            let passwordMatches = bcryptjs_1.default.compareSync(logins.password, hashedPassword);
            if (passwordMatches) {
                // Update isActive to 1 (true) when the user logs in
                await pool.request()
                    .input("id", user[0].id)
                    .query("UPDATE users SET isActive = 1 WHERE id = @id");
                let { createdAt, password, phoneNumber, isActive, isDelete, ...rest } = user[0];
                let token = jsonwebtoken_1.default.sign(rest, process.env.SECRET_KEY, {
                    expiresIn: '2h'
                });
                return {
                    message: "Logged in successfully",
                    token
                };
            }
            else {
                return {
                    error: "Incorrect password"
                };
            }
        }
    }
    async logout(userId) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        await pool.request()
            .input("id", userId)
            .query("UPDATE users SET isActive = 0 WHERE id = @id");
        return {
            message: "Logged out successfully"
        };
    }
}
exports.authService = authService;
