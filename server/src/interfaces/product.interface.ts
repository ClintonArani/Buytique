export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_path: string;
    stock_quantity: number;
    category_id: string; // Foreign key referencing the categories table
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
}