export interface Order {
    id: string;
    user_id: string; // Foreign key referencing the users table
    total_price: number;
    createdAt: string;
    updatedAt?: string;
    isDeleted: boolean;
}
