import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';

const chatbotService = new ChatbotService();

export class ChatbotController {
    async handleMessage(req: Request, res: Response) {
        try {
            const { message } = req.body;

            if (!message || typeof message !== 'string') {
                return res.status(400).json({
                    error: "Message is required and must be a string"
                });
            }

            const response = await chatbotService.processMessage(message);
            return res.status(200).json(response);
        } catch (error) {
            console.error('Error in chatbot controller:', error);
            return res.status(500).json({
                error: "An error occurred while processing your message"
            });
        }
    }
}