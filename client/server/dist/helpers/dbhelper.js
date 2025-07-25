"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const sqlConfig_1 = require("../config/sqlConfig");
class ConnectionDB {
    static async query(query) {
        const pool = mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let request = ((await pool).request().query(query));
        return request;
    }
    static async executeQuery(procedureName, data) {
        const pool = mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let request = ((await pool).request());
        for (let key in data) {
            request.input(key, data[key]);
        }
        const result = await request.execute(procedureName);
        return result;
    }
}
exports.default = ConnectionDB;
