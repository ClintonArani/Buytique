import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';

const controller = new ChatbotController();
const chatbotRouter = Router();

chatbotRouter.post('/ask', controller.handleMessage);

export default chatbotRouter;