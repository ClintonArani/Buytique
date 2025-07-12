import mssql from 'mssql';
import { v4 } from 'uuid';
import { Product } from '../interfaces/product.interface';
import { sqlConfig } from '../config/sqlConfig';
import path from 'path';
import fs from 'fs';

export class ProductService {
    async addProduct(product: Product, imageFile: any) {
        let pool = await mssql.connect(sqlConfig);
    
        let product_id = v4();
        let createdAt = new Date();
    
        if (!imageFile || !imageFile.name) {
            throw new Error("No file uploaded or file is invalid");
        }

        const imageName = `${Date.now()}-${imageFile.name}`; 
        const imagePath = path.join(__dirname, '..', 'uploads', imageName);
    
        await imageFile.mv(imagePath);
    
        const relativeImagePath = `uploads/${imageName}`;
    
        if (pool.connected) {
            let result = (await pool.request()
                .input("id", mssql.VarChar, product_id)
                .input("name", mssql.VarChar, product.name)
                .input("description", mssql.Text, product.description)
                .input("price", mssql.Decimal(10, 2), product.price)
                .input("image_path", mssql.VarChar, relativeImagePath)
                .input("stock_quantity", mssql.Int, product.stock_quantity)
                .input("category_id", mssql.VarChar, product.category_id)
                .input("createdAt", mssql.DateTime, createdAt)
                .execute("addProduct")).rowsAffected;
    
            if (result[0] == 1) {
                return {
                    message: "Product added successfully",
                    imagePath: relativeImagePath 
                };
            } else {
                fs.unlinkSync(imagePath);
                return {
                    error: "Unable to add product"
                };
            }
        } else {
            return {
                error: "Unable to establish connection"
            };
        }
    }

    async getAllProducts() {
        let pool = await mssql.connect(sqlConfig);
    
        let result = (await pool.request()
            .execute("getAllProducts")).recordset;
    
        if (result.length == 0) {
            return {
                message: "No products available"
            };
        } else {
            return {
                products: result
            };
        }
    }

    async getSingleProduct(product_id: string) {
        let pool = await mssql.connect(sqlConfig);
    
        let result = (await pool.request()
            .input("id", mssql.VarChar, product_id)
            .execute("getSingleProduct")).recordset;
    
        if (result.length === 0) {
            return {
                error: "Product not found or has been deleted"
            };
        } else {
            return {
                product: result[0]
            };
        }
    }

    async updateProduct(product_id: string, updatedProduct: Partial<Product>, imageFile?: any) {
        let pool = await mssql.connect(sqlConfig);
        let updatedAt = new Date();
    
        // First get the current product to find the old image path
        const currentProduct = (await pool.request()
            .input("id", mssql.VarChar, product_id)
            .execute("getSingleProduct")).recordset[0];
    
        if (!currentProduct) {
            throw new Error("Product not found");
        }
    
        let imagePath: string | undefined = currentProduct.image_path;
        let oldImagePath: string | undefined;
    
        if (imageFile && imageFile.name) {
            // Generate new image path
            const imageName = `${Date.now()}-${imageFile.name}`;
            const newImagePath = path.join(__dirname, '..', 'uploads', imageName);
    
            // Save the new image
            await imageFile.mv(newImagePath);
    
            // Set paths for update
            oldImagePath = path.join(__dirname, '..', currentProduct.image_path);
            imagePath = `uploads/${imageName}`;
        }
    
        try {
            let result = (await pool.request()
                .input("id", mssql.VarChar, product_id)
                .input("name", mssql.VarChar, updatedProduct.name)
                .input("description", mssql.Text, updatedProduct.description)
                .input("price", mssql.Decimal(10, 2), updatedProduct.price)
                .input("image_path", mssql.VarChar, imagePath)
                .input("stock_quantity", mssql.Int, updatedProduct.stock_quantity)
                .input("category_id", mssql.VarChar, updatedProduct.category_id)
                .input("updatedAt", mssql.DateTime, updatedAt)
                .execute("updateProduct")).rowsAffected;
    
            if (result[0] == 1) {
                // Delete the old image if it was replaced
                if (oldImagePath && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                return {
                    message: "Product updated successfully",
                    imagePath
                };
            } else {
                // If update failed, delete the new image that was just saved
                if (imageFile && imagePath) {
                    const newImageFullPath = path.join(__dirname, '..', imagePath);
                    if (fs.existsSync(newImageFullPath)) {
                        fs.unlinkSync(newImageFullPath);
                    }
                }
                return {
                    error: "Unable to update product"
                };
            }
        } catch (error) {
            // If error occurred, delete the new image that was just saved
            if (imageFile && imagePath) {
                const newImageFullPath = path.join(__dirname, '..', imagePath);
                if (fs.existsSync(newImageFullPath)) {
                    fs.unlinkSync(newImageFullPath);
                }
            }
            throw error;
        }
    }

    async deleteProduct(product_id: string) {
        let pool = await mssql.connect(sqlConfig);

        let result = (await pool.request()
            .input("id", mssql.VarChar, product_id)
            .execute("deleteProduct")).rowsAffected;

        if (result[0] == 1) {
            return {
                message: "Product deleted successfully"
            };
        } else {
            return {
                error: "Unable to delete product"
            };
        }
    }
}