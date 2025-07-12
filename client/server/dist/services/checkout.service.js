"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sqlConfig_1 = require("../config/sqlConfig");
class CheckoutService {
    async checkout(user_id) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        try {
            let result = (await pool.request()
                .input("user_id", mssql_1.default.VarChar, user_id)
                .execute("checkout")).recordset;
            if (result.length > 0) {
                return {
                    message: "Checkout successful",
                    order: result[0]
                };
            }
            else {
                return {
                    error: "Unable to complete checkout"
                };
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CheckoutService = CheckoutService;
