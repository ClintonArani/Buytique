export interface CartItem {
    id: string;
    user_id: string; // Foreign key referencing the users table
    product_id: string; // Foreign key referencing the products table
    quantity: number;
    createdAt: string;
    updatedAt?: string;
    isDeleted: boolean;
}