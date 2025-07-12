export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    oldPrice: number;
    image: string;
    versions?: string[];
    quantity?: number; 
  }
  

  export interface IProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    image_path: string;
    category_id: string;
    category_name?: string;
    stock_quantity: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }