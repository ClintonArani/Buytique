import mssql from 'mssql';
import { v4 } from 'uuid';
import { Category } from '../interfaces/category.interface';
import { sqlConfig } from '../config/sqlConfig';

export class CategoryService {
    async addCategory(category: Category) {
        let pool = await mssql.connect(sqlConfig);

        let category_id = v4();
        let createdAt = new Date();

        if (pool.connected) {
            let result = (await pool.request()
                .input("id", mssql.VarChar, category_id)
                .input("name", mssql.VarChar, category.name)
                .input("description", mssql.Text, category.description)
                .input("createdAt", mssql.DateTime, createdAt)
                .execute("addCategory")).rowsAffected;

            if (result[0] == 1) {
                return {
                    message: "Category added successfully"
                };
            } else {
                return {
                    error: "Unable to add category"
                };
            }
        } else {
            return {
                error: "Unable to establish connection"
            };
        }
    }

    async updateCategory(category_id: string, updatedCategory: Partial<Category>) {
        let pool = await mssql.connect(sqlConfig);
        let updatedAt = new Date();

        try {
            let result = (await pool.request()
                .input("id", mssql.VarChar, category_id)
                .input("name", mssql.VarChar, updatedCategory.name)
                .input("description", mssql.Text, updatedCategory.description)
                .input("updatedAt", mssql.DateTime, updatedAt)
                .execute("updateCategory")).rowsAffected;

            if (result[0] == 1) {
                return {
                    message: "Category updated successfully"
                };
            } else {
                return {
                    error: "Unable to update category"
                };
            }
        } catch (error) {
            throw error;
        }
    }

    async getAllCategories() {
        let pool = await mssql.connect(sqlConfig);

        let result = (await pool.request()
            .execute("getAllCategories")).recordset;

        if (result.length == 0) {
            return {
                message: "No categories available"
            };
        } else {
            return {
                categories: result
            };
        }
    }

    async getSingleCategory(category_id: string) {
        let pool = await mssql.connect(sqlConfig);

        let result = (await pool.request()
            .input("id", mssql.VarChar, category_id)
            .execute("getSingleCategory")).recordset;

        if (result.length === 0) {
            return {
                error: "Category not found or has been deleted"
            };
        } else {
            return {
                category: result[0]
            };
        }
    }

    async deleteCategory(category_id: string) {
        let pool = await mssql.connect(sqlConfig);

        let result = (await pool.request()
            .input("id", mssql.VarChar, category_id)
            .execute("deleteCategory")).rowsAffected;

        if (result[0] == 1) {
            return {
                message: "Category deleted successfully"
            };
        } else {
            return {
                error: "Unable to delete category"
            };
        }
    }
}