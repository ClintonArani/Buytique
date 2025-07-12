"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const product_router_1 = __importDefault(require("./routers/product.router")); // Import the product router
const dotenv_1 = __importDefault(require("dotenv"));
const category_router_1 = __importDefault(require("./routers/category.router"));
const cart_item_router_1 = __importDefault(require("./routers/cart-item.router"));
const checkout_router_1 = __importDefault(require("./routers/checkout.router"));
const order_router_1 = __importDefault(require("./routers/order.router"));
const path = __importStar(require("path"));
const chatbot_router_1 = __importDefault(require("./routers/chatbot.router"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, express_1.json)());
app.use((0, cors_1.default)());
app.use((0, express_fileupload_1.default)({
    createParentPath: true, // Create the uploads folder if it doesn't exist
    limits: { fileSize: 50 * 1024 * 1024 } // Limit file size to 50MB
}));
// Add logging middleware to capture request details
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});
// Add routers
app.use('/users', user_router_1.default);
app.use('/auth', auth_router_1.default);
app.use('/products', product_router_1.default);
app.use('/categories', category_router_1.default);
app.use('/cart-items', cart_item_router_1.default);
app.use('/checkout', checkout_router_1.default);
app.use('/orders', order_router_1.default);
app.use('/chatbot', chatbot_router_1.default);
// Serve static files from the "uploads" directory
app.use('/uploads', express_1.default.static(path.join(__dirname, 'uploads')));
// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});
// Create HTTP server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
