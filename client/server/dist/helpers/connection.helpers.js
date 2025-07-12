"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const sqlConfig_1 = require("../config/sqlConfig");
class Connection {
    static query(arg0) {
        throw new Error('Method not implemented.');
    }
    static execute(arg0, arg1) {
        throw new Error('Method not implemented.');
    }
    executeQury(query) {
        let pool = mssql_1.default.connect(sqlConfig_1.sqlConfig);
    }
}
exports.default = Connection;
