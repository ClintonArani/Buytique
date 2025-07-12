import { Request, Response } from 'express';
import { CartItemService } from '../services/cart-item.service';
import { cartItemSchema } from '../validators/cart-item.validator';

let service = new CartItemService();

export class CartItemController {
    async addCartItem(req: Request, res: Response) {
        try {
            let { error } = cartItemSchema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    error: error.message
                });
            }

            let result = await service.addCartItem(req.body);

            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while adding item to cart"
            });
        }
    }

    async removeCartItem(req: Request, res: Response) {
        try {
            let { cart_item_id } = req.params;

            let result = await service.removeCartItem(cart_item_id);

            if (result.error) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while removing item from cart"
            });
        }
    }

    async getCartItems(req: Request, res: Response) {
        try {
            let { user_id } = req.params;

            let result = await service.getCartItems(user_id);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred while fetching cart items"
            });
        }
    }
}