"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const category_validator_1 = require("../validators/category.validator");
let service = new category_service_1.CategoryService();
class CategoryController {
    async addCategory(req, res) {
        try {
            let { error } = category_validator_1.categorySchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: error.message
                });
            }
            let result = await service.addCategory(req.body);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while adding the category"
            });
        }
    }
    async updateCategory(req, res) {
        try {
            let { category_id } = req.params;
            let updatedCategory = req.body;
            let result = await service.updateCategory(category_id, updatedCategory);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while updating the category"
            });
        }
    }
    async getAllCategories(req, res) {
        try {
            let result = await service.getAllCategories();
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while fetching categories"
            });
        }
    }
    async getSingleCategory(req, res) {
        try {
            let { category_id } = req.params;
            let result = await service.getSingleCategory(category_id);
            if (result.error) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while fetching the category"
            });
        }
    }
    async deleteCategory(req, res) {
        try {
            let { category_id } = req.params;
            let result = await service.deleteCategory(category_id);
            if (result.error) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while deleting the category"
            });
        }
    }
}
exports.CategoryController = CategoryController;
