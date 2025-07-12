import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';

const controller = new CheckoutController();
const checkout_router = Router();

checkout_router.post('/:user_id', controller.checkout);

export default checkout_router;