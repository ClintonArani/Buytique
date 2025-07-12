import { Request, Response } from 'express';
import { CheckoutService } from '../services/checkout.service';

let service = new CheckoutService();

export class CheckoutController {
    async checkout(req: Request, res: Response) {
        try {
            let { user_id } = req.params;

            let result = await service.checkout(user_id);

            if (result.error) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "An error occurred during checkout"
            });
        }
    }
}