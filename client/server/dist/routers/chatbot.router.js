"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatbot_controller_1 = require("../controllers/chatbot.controller");
const controller = new chatbot_controller_1.ChatbotController();
const chatbotRouter = (0, express_1.Router)();
chatbotRouter.post('/ask', controller.handleMessage);
exports.default = chatbotRouter;
