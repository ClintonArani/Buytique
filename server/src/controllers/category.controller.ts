import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { categorySchema } from '../validators/category.validator';

let service = new CategoryService();

export class CategoryController {
    async addCategory(req: Request, res: Response) {
        try {
            let { error } = categorySchema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    error: error.message
                });
            }

            let result = await service.addCategory(req.body);

            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while adding the category"
            });
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
            let { category_id } = req.params;
            let updatedCategory = req.body;

            let result = await service.updateCategory(category_id, updatedCategory);

            if (result.error) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while updating the category"
            });
        }
    }

    async getAllCategories(req: Request, res: Response) {
        try {
            let result = await service.getAllCategories();

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while fetching categories"
            });
        }
    }

    async getSingleCategory(req: Request, res: Response) {
        try {
            let { category_id } = req.params;

            let result = await service.getSingleCategory(category_id);

            if (result.error) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while fetching the category"
            });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            let { category_id } = req.params;

            let result = await service.deleteCategory(category_id);

            if (result.error) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while deleting the category"
            });
        }
    }
}