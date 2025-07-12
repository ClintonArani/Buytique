"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
let service = new auth_service_1.authService();
class authController {
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const response = await service.login({ email, password });
            if (response.error) {
                return res.status(401).json({ error: response.error });
            }
            return res.status(200).json(response);
        }
        catch (error) {
            console.error("Error occurred in loginUser:", error);
            return res.status(500).json({ error: "An internal server error occurred" });
        }
    }
    async checkDetails(req, res) {
        try {
            if (req.info) {
                return res.status(200).json({
                    info: req.info
                });
            }
            else {
                return res.status(404).json({ error: "No details found" });
            }
        }
        catch (error) {
            console.error("Error occurred in checkDetails:", error);
            return res.status(500).json({ error: "An internal server error occurred" });
        }
    }
    async logoutUser(req, res) {
        try {
            const userId = req.info?.id; // Assuming the user ID is in the token
            if (!userId) {
                return res.status(401).json({ error: "User ID not found" });
            }
            const response = await service.logout(userId);
            return res.status(200).json(response);
        }
        catch (error) {
            console.error("Error occurred in logoutUser:", error);
            return res.status(500).json({ error: "An internal server error occurred" });
        }
    }
}
exports.authController = authController;
