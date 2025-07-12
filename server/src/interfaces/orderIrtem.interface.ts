export interface OrderItem {
    id: string;
    order_id: string; // Foreign key referencing the orders table
    product_id: string; // Foreign key referencing the products table
    quantity: number;
    price: number;
    createdAt: string;
    updatedAt?: string;
    isDeleted: boolean;
}