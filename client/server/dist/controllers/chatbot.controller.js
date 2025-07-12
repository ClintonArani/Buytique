"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = void 0;
const chatbot_service_1 = require("../services/chatbot.service");
const chatbotService = new chatbot_service_1.ChatbotService();
class ChatbotController {
    async handleMessage(req, res) {
        try {
            const { message } = req.body;
            if (!message || typeof message !== 'string') {
                return res.status(400).json({
                    error: "Message is required and must be a string"
                });
            }
            const response = await chatbotService.processMessage(message);
            return res.status(200).json(response);
        }
        catch (error) {
            console.error('Error in chatbot controller:', error);
            return res.status(500).json({
                error: "An error occurred while processing your message"
            });
        }
    }
}
exports.ChatbotController = ChatbotController;
