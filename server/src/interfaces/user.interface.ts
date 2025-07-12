export interface User {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string,
    university: string,
    role: string,
    createdAt: string,
    updatedAt?: string
    profile?: string,
    isActive: boolean;
    isDelete: boolean;
    isUpdated: boolean;
  }
  
export interface login_details{
    email:string,
    password:string
}

export interface token_datails{
    id:string,
    firstName:string,
    lastName:string,
    email:string,
    role:string
}