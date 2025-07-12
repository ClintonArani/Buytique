import { Router } from 'express';
import { CartItemController } from '../controllers/cart-item.controller';

const controller = new CartItemController();
const cart_item_router = Router();

cart_item_router.post('/add', controller.addCartItem);
cart_item_router.delete('/remove/:cart_item_id', controller.removeCartItem);
cart_item_router.get('/items/:user_id', controller.getCartItems);

export default cart_item_router;