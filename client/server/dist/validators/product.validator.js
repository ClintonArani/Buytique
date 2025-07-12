"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.productSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    description: joi_1.default.string().required(),
    price: joi_1.default.number().positive().required(),
    stock_quantity: joi_1.default.number().integer().min(0).required(),
    category_id: joi_1.default.string().required(),
});
