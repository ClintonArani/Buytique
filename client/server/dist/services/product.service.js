"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const uuid_1 = require("uuid");
const sqlConfig_1 = require("../config/sqlConfig");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ProductService {
    async addProduct(product, imageFile) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let product_id = (0, uuid_1.v4)();
        let createdAt = new Date();
        if (!imageFile || !imageFile.name) {
            throw new Error("No file uploaded or file is invalid");
        }
        const imageName = `${Date.now()}-${imageFile.name}`;
        const imagePath = path_1.default.join(__dirname, '..', 'uploads', imageName);
        await imageFile.mv(imagePath);
        const relativeImagePath = `uploads/${imageName}`;
        if (pool.connected) {
            let result = (await pool.request()
                .input("id", mssql_1.default.VarChar, product_id)
                .input("name", mssql_1.default.VarChar, product.name)
                .input("description", mssql_1.default.Text, product.description)
                .input("price", mssql_1.default.Decimal(10, 2), product.price)
                .input("image_path", mssql_1.default.VarChar, relativeImagePath)
                .input("stock_quantity", mssql_1.default.Int, product.stock_quantity)
                .input("category_id", mssql_1.default.VarChar, product.category_id)
                .input("createdAt", mssql_1.default.DateTime, createdAt)
                .execute("addProduct")).rowsAffected;
            if (result[0] == 1) {
                return {
                    message: "Product added successfully",
                    imagePath: relativeImagePath
                };
            }
            else {
                fs_1.default.unlinkSync(imagePath);
                return {
                    error: "Unable to add product"
                };
            }
        }
        else {
            return {
                error: "Unable to establish connection"
            };
        }
    }
    async getAllProducts() {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .execute("getAllProducts")).recordset;
        if (result.length == 0) {
            return {
                message: "No products available"
            };
        }
        else {
            return {
                products: result
            };
        }
    }
    async getSingleProduct(product_id) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .input("id", mssql_1.default.VarChar, product_id)
            .execute("getSingleProduct")).recordset;
        if (result.length === 0) {
            return {
                error: "Product not found or has been deleted"
            };
        }
        else {
            return {
                product: result[0]
            };
        }
    }
    async updateProduct(product_id, updatedProduct, imageFile) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let updatedAt = new Date();
        // First get the current product to find the old image path
        const currentProduct = (await pool.request()
            .input("id", mssql_1.default.VarChar, product_id)
            .execute("getSingleProduct")).recordset[0];
        if (!currentProduct) {
            throw new Error("Product not found");
        }
        let imagePath = currentProduct.image_path;
        let oldImagePath;
        if (imageFile && imageFile.name) {
            // Generate new image path
            const imageName = `${Date.now()}-${imageFile.name}`;
            const newImagePath = path_1.default.join(__dirname, '..', 'uploads', imageName);
            // Save the new image
            await imageFile.mv(newImagePath);
            // Set paths for update
            oldImagePath = path_1.default.join(__dirname, '..', currentProduct.image_path);
            imagePath = `uploads/${imageName}`;
        }
        try {
            let result = (await pool.request()
                .input("id", mssql_1.default.VarChar, product_id)
                .input("name", mssql_1.default.VarChar, updatedProduct.name)
                .input("description", mssql_1.default.Text, updatedProduct.description)
                .input("price", mssql_1.default.Decimal(10, 2), updatedProduct.price)
                .input("image_path", mssql_1.default.VarChar, imagePath)
                .input("stock_quantity", mssql_1.default.Int, updatedProduct.stock_quantity)
                .input("category_id", mssql_1.default.VarChar, updatedProduct.category_id)
                .input("updatedAt", mssql_1.default.DateTime, updatedAt)
                .execute("updateProduct")).rowsAffected;
            if (result[0] == 1) {
                // Delete the old image if it was replaced
                if (oldImagePath && fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
                return {
                    message: "Product updated successfully",
                    imagePath
                };
            }
            else {
                // If update failed, delete the new image that was just saved
                if (imageFile && imagePath) {
                    const newImageFullPath = path_1.default.join(__dirname, '..', imagePath);
                    if (fs_1.default.existsSync(newImageFullPath)) {
                        fs_1.default.unlinkSync(newImageFullPath);
                    }
                }
                return {
                    error: "Unable to update product"
                };
            }
        }
        catch (error) {
            // If error occurred, delete the new image that was just saved
            if (imageFile && imagePath) {
                const newImageFullPath = path_1.default.join(__dirname, '..', imagePath);
                if (fs_1.default.existsSync(newImageFullPath)) {
                    fs_1.default.unlinkSync(newImageFullPath);
                }
            }
            throw error;
        }
    }
    async deleteProduct(product_id) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .input("id", mssql_1.default.VarChar, product_id)
            .execute("deleteProduct")).rowsAffected;
        if (result[0] == 1) {
            return {
                message: "Product deleted successfully"
            };
        }
        else {
            return {
                error: "Unable to delete product"
            };
        }
    }
}
exports.ProductService = ProductService;
