"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const uuid_1 = require("uuid");
const sqlConfig_1 = require("../config/sqlConfig");
class CategoryService {
    async addCategory(category) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let category_id = (0, uuid_1.v4)();
        let createdAt = new Date();
        if (pool.connected) {
            let result = (await pool.request()
                .input("id", mssql_1.default.VarChar, category_id)
                .input("name", mssql_1.default.VarChar, category.name)
                .input("description", mssql_1.default.Text, category.description)
                .input("createdAt", mssql_1.default.DateTime, createdAt)
                .execute("addCategory")).rowsAffected;
            if (result[0] == 1) {
                return {
                    message: "Category added successfully"
                };
            }
            else {
                return {
                    error: "Unable to add category"
                };
            }
        }
        else {
            return {
                error: "Unable to establish connection"
            };
        }
    }
    async updateCategory(category_id, updatedCategory) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let updatedAt = new Date();
        try {
            let result = (await pool.request()
                .input("id", mssql_1.default.VarChar, category_id)
                .input("name", mssql_1.default.VarChar, updatedCategory.name)
                .input("description", mssql_1.default.Text, updatedCategory.description)
                .input("updatedAt", mssql_1.default.DateTime, updatedAt)
                .execute("updateCategory")).rowsAffected;
            if (result[0] == 1) {
                return {
                    message: "Category updated successfully"
                };
            }
            else {
                return {
                    error: "Unable to update category"
                };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async getAllCategories() {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .execute("getAllCategories")).recordset;
        if (result.length == 0) {
            return {
                message: "No categories available"
            };
        }
        else {
            return {
                categories: result
            };
        }
    }
    async getSingleCategory(category_id) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .input("id", mssql_1.default.VarChar, category_id)
            .execute("getSingleCategory")).recordset;
        if (result.length === 0) {
            return {
                error: "Category not found or has been deleted"
            };
        }
        else {
            return {
                category: result[0]
            };
        }
    }
    async deleteCategory(category_id) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .input("id", mssql_1.default.VarChar, category_id)
            .execute("deleteCategory")).rowsAffected;
        if (result[0] == 1) {
            return {
                message: "Category deleted successfully"
            };
        }
        else {
            return {
                error: "Unable to delete category"
            };
        }
    }
}
exports.CategoryService = CategoryService;
