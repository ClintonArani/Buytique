"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItemController = void 0;
const cart_item_service_1 = require("../services/cart-item.service");
const cart_item_validator_1 = require("../validators/cart-item.validator");
let service = new cart_item_service_1.CartItemService();
class CartItemController {
    async addCartItem(req, res) {
        try {
            let { error } = cart_item_validator_1.cartItemSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: error.message
                });
            }
            let result = await service.addCartItem(req.body);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while adding item to cart"
            });
        }
    }
    async removeCartItem(req, res) {
        try {
            let { cart_item_id } = req.params;
            let result = await service.removeCartItem(cart_item_id);
            if (result.error) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while removing item from cart"
            });
        }
    }
    async getCartItems(req, res) {
        try {
            let { user_id } = req.params;
            let result = await service.getCartItems(user_id);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while fetching cart items"
            });
        }
    }
}
exports.CartItemController = CartItemController;
