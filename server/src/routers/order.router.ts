import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const controller = new OrderController();
const order_router = Router();

order_router.post('/cancel/:order_id', controller.cancelOrder);
order_router.put('/update-status/:order_id', controller.updateOrderStatus);
order_router.get('/all', controller.getAllOrders);
order_router.get('/top-products', controller.getTopSellingProducts);
order_router.get('/recent', controller.getRecentOrders);
order_router.get('/sales-overview', controller.getSalesOverview);

order_router.get('/user/:user_id', controller.getUserOrders);
order_router.get('/user/:user_id/monthly-spending', controller.getUserMonthlySpending);
order_router.get('/user/:user_id/recent-orders', controller.getUserRecentOrders);
order_router.get('/user/:user_id/recommended-products', controller.getRecommendedProducts);
order_router.get('/user/:user_id/purchase-history', controller.getUserPurchaseHistory);

export default order_router;