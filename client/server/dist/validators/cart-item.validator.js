"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartItemSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.cartItemSchema = joi_1.default.object({
    user_id: joi_1.default.string().required(),
    product_id: joi_1.default.string().required(),
    quantity: joi_1.default.number().integer().min(1).required(),
});
