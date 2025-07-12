"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
let service = new order_service_1.OrderService();
class OrderController {
    async cancelOrder(req, res) {
        try {
            let { order_id } = req.params;
            let result = await service.cancelOrder(order_id);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while cancelling the order"
            });
        }
    }
    async updateOrderStatus(req, res) {
        try {
            let { order_id } = req.params;
            let { new_status } = req.body;
            let result = await service.updateOrderStatus(order_id, new_status);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: "An error occurred while updating the order status"
            });
        }
    }
    async getAllOrders(req, res) {
        try {
            let result = await service.getAllOrders();
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("Error fetching orders:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                error: "An error occurred while fetching orders",
                details: errorMessage
            });
        }
    }
    // order.controller.ts
    async getTopSellingProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const result = await service.getTopSellingProducts(limit);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while fetching top selling products",
                details: error.message
            });
        }
    }
    // order.controller.ts
    async getRecentOrders(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const result = await service.getRecentOrders(limit);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while fetching recent orders",
                details: error.message
            });
        }
    }
    async getSalesOverview(req, res) {
        try {
            const result = await service.getSalesOverview();
            // You can add additional transformations here if needed
            res.status(200).json(result);
        }
        catch (error) {
            console.error('[SalesOverview Error]', error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch sales overview",
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getUserOrders(req, res) {
        try {
            const { user_id } = req.params;
            const result = await service.getUserOrders(user_id);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while fetching user orders",
                details: error.message
            });
        }
    }
    async getUserMonthlySpending(req, res) {
        try {
            const { user_id } = req.params;
            const months = parseInt(req.query.months) || 6;
            const result = await service.getUserMonthlySpending(user_id, months);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while fetching monthly spending",
                details: error.message
            });
        }
    }
    async getUserRecentOrders(req, res) {
        try {
            const { user_id } = req.params;
            const limit = parseInt(req.query.limit) || 5;
            const result = await service.getUserRecentOrders(user_id, limit);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while fetching user recent orders",
                details: error.message
            });
        }
    }
    async getRecommendedProducts(req, res) {
        try {
            const { user_id } = req.params;
            const limit = parseInt(req.query.limit) || 5;
            const result = await service.getRecommendedProducts(user_id, limit);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while fetching recommended products",
                details: error.message
            });
        }
    }
    async getUserPurchaseHistory(req, res) {
        try {
            const { user_id } = req.params;
            const result = await service.getUserPurchaseHistory(user_id);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while fetching purchase history",
                details: error.message
            });
        }
    }
}
exports.OrderController = OrderController;
