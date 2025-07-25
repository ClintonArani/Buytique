"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const product_validator_1 = require("../validators/product.validator");
let service = new product_service_1.ProductService();
class ProductController {
    async addProduct(req, res) {
        try {
            // Validate the request body
            let { error } = product_validator_1.productSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: error.message
                });
            }
            // Check if an image file was uploaded
            if (!req.files || !req.files.image) {
                return res.status(400).json({
                    error: "Image file is required"
                });
            }
            const imageFile = req.files.image; // Get the uploaded image file
            // Add the product to the database
            let result = await service.addProduct(req.body, imageFile);
            return res.status(201).json(result);
        }
        catch (error) {
            console.error("Error in addProduct controller:", error);
            return res.status(500).json({
                error: "An error occurred while adding the product"
            });
        }
    }
    async getAllProducts(req, res) {
        try {
            // Fetch all products from the database
            let result = await service.getAllProducts();
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("Error in getAllProducts controller:", error);
            return res.status(500).json({
                error: "An error occurred while fetching products"
            });
        }
    }
    async getSingleProduct(req, res) {
        try {
            let { product_id } = req.params;
            // Fetch a single product by its ID
            let result = await service.getSingleProduct(product_id);
            if (result.error) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("Error in getSingleProduct controller:", error);
            return res.status(500).json({
                error: "An error occurred while fetching the product"
            });
        }
    }
    async updateProduct(req, res) {
        try {
            let { product_id } = req.params;
            let updatedProduct = req.body;
            // Check if an image file was uploaded
            const imageFile = req.files?.image;
            // Update the product in the database
            let result = await service.updateProduct(product_id, updatedProduct, imageFile);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("Error in updateProduct controller:", error);
            return res.status(500).json({
                error: "An error occurred while updating the product"
            });
        }
    }
    async deleteProduct(req, res) {
        try {
            let { product_id } = req.params;
            // Delete the product from the database
            let result = await service.deleteProduct(product_id);
            if (result.error) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("Error in deleteProduct controller:", error);
            return res.status(500).json({
                error: "An error occurred while deleting the product"
            });
        }
    }
}
exports.ProductController = ProductController;
