"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutController = void 0;
const checkout_service_1 = require("../services/checkout.service");
let service = new checkout_service_1.CheckoutService();
class CheckoutController {
    async checkout(req, res) {
        try {
            let { user_id } = req.params;
            let result = await service.checkout(user_id);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred during checkout"
            });
        }
    }
}
exports.CheckoutController = CheckoutController;
