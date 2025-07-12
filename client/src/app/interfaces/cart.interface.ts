export interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    name: string;
    price: number;
    image_path: string;
  }
  
  export interface CartResponse {
    cartItems: CartItem[];
  }