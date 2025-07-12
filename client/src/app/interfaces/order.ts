interface Order {
    id: string;
    status: string;
    isUpdating?: boolean;
  }
  
  interface ApiResponse {
    success?: boolean;
    message?: string;
  }
  