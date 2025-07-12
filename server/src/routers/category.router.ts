import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const controller = new CategoryController();
const category_router = Router();

category_router.post('/add', controller.addCategory);
category_router.get('/all', controller.getAllCategories);
category_router.get('/:category_id', controller.getSingleCategory);
category_router.put('/update/:category_id', controller.updateCategory);
category_router.delete('/delete/:category_id', controller.deleteCategory);

export default category_router;