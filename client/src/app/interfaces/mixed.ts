// Generic API Response Interface
export interface IApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
  }
  
  // Recommended Products Data Structure
  export interface IRecommendedProductsData {
    recommendedProducts: IProduct[];
  }
  
  // Product Interface
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
  
  // Decoded Token Interface
  export interface DecodedToken {
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
  }

  export interface Category {
    id: string;
    name: string;
  }