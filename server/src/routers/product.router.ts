import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const controller = new ProductController();
const product_router = Router();

product_router.post('/add', controller.addProduct);
product_router.get('/all', controller.getAllProducts);
product_router.get('/:product_id', controller.getSingleProduct);
product_router.put('/update/:product_id', controller.updateProduct);
product_router.delete('/delete/:product_id', controller.deleteProduct);

export default product_router;