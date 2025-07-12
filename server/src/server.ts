import express, { NextFunction, Request, Response, json } from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import user_router from './routers/user.router';
import auth_router from './routers/auth.router';
import product_router from './routers/product.router'; // Import the product router
import dotenv from 'dotenv';
import { createServer } from 'http';
import category_router from './routers/category.router';
import cart_item_router from './routers/cart-item.router';
import checkout_router from './routers/checkout.router';
import order_router from './routers/order.router';
import * as path from 'path';
import chatbotRouter from './routers/chatbot.router';


dotenv.config();

const app = express();
app.use(json());
app.use(cors());

app.use(fileUpload({
  createParentPath: true, // Create the uploads folder if it doesn't exist
  limits: { fileSize: 50 * 1024 * 1024 } // Limit file size to 50MB
}));

// Add logging middleware to capture request details
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Add routers
app.use('/users', user_router);
app.use('/auth', auth_router);
app.use('/products', product_router);
app.use('/categories', category_router);
app.use('/cart-items', cart_item_router);
app.use('/checkout', checkout_router);
app.use('/orders', order_router);
app.use('/chatbot', chatbotRouter)
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle 404 errors
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// Create HTTP server


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});