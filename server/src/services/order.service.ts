import * as mssql from 'mssql';
import { Order} from '../interfaces/order.interface';
import { sqlConfig } from '../config/sqlConfig';
import { SalesOverviewResponse, SalesSummary, SalesTrend, TopProduct, StatusDistribution } from '../interfaces/sales-overview.interface';


export class OrderService {
    async cancelOrder(order_id: string) {
        let pool = await mssql.connect(sqlConfig);

        try {
            let result = (await pool.request()
                .input("order_id", mssql.VarChar, order_id)
                .execute("cancelOrder")).recordset;

            if (result.length > 0) {
                return {
                    message: "Order cancelled successfully",
                    order: result[0]
                };
            } else {
                return {
                    error: "Unable to cancel order"
                };
            }
        } catch (error) {
            throw error;
        }
    }

    async updateOrderStatus(order_id: string, new_status: string) {
        let pool = await mssql.connect(sqlConfig);

        try {
            let result = (await pool.request()
                .input("order_id", mssql.VarChar, order_id)
                .input("new_status", mssql.VarChar, new_status)
                .execute("updateOrderStatus")).recordset;

            if (result.length > 0) {
                return {
                    message: "Order status updated successfully",
                    order: result[0]
                };
            } else {
                return {
                    error: "Unable to update order status"
                };
            }
        } catch (error) {
            throw error;
        }
    }

    async getAllOrders() {
        let pool = await mssql.connect(sqlConfig);
        try {
            let result = (await pool.request()
                .execute("getAllOrders")).recordset;
            return {
                message: "Orders fetched successfully",
                orders: result
            };
        } catch (error) {
            console.error("Database error in getAllOrders:", error);
            throw error;
        }
    }

    // order.service.ts
    async getTopSellingProducts(limit: number = 10) {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            let result = await pool.request()
                .input("limit", mssql.Int, limit)
                .execute("getTopSellingProducts");
                
            return {
                success: true,
                products: result.recordset
            };
        } catch (error) {
            console.error("Error fetching top selling products:", error);
            throw new Error(`Failed to fetch top selling products: ${(error as Error).message}`);
        }
    }

    // order.service.ts
    async getRecentOrders(limit: number = 10) {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            let result = await pool.request()
                .input("limit", mssql.Int, limit)
                .execute("getRecentOrders");
                
            // Parse the JSON order_items for each order
            const orders = result.recordset.map(order => ({
                ...order,
                order_items: order.order_items ? JSON.parse(order.order_items) : []
            }));
            
            return {
                success: true,
                orders: orders
            };
        } catch (error) {
            console.error("Error fetching recent orders:", error);
            throw new Error(`Failed to fetch recent orders: ${(error as Error).message}`);
        }
    }

    async getSalesOverview(): Promise<SalesOverviewResponse> {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            const result = await pool.request().execute("getSalesOverview");
            
            // Type guard functions
            const isSalesSummary = (data: any): data is SalesSummary => {
                return data && 
                       typeof data.total_revenue === 'number' && 
                       typeof data.total_orders === 'number';
            };
    
            // Ensure recordsets exists and has the expected structure
            if (!result.recordsets || !Array.isArray(result.recordsets)) {
                throw new Error("Invalid recordsets format from database");
            }
    
            // Cast the recordsets to the expected types
            const recordsets = result.recordsets as [
                mssql.IRecordSet<SalesSummary>,
                mssql.IRecordSet<SalesTrend>,
                mssql.IRecordSet<TopProduct>,
                mssql.IRecordSet<StatusDistribution>
            ];
    
            // Validate we have all required recordsets
            if (recordsets.length < 4) {
                throw new Error(`Expected 4 recordsets, got ${recordsets.length}`);
            }
    
            // Validate the first recordset has data
            if (!recordsets[0] || recordsets[0].length === 0) {
                throw new Error("No summary data found");
            }
    
            return {
                success: true,
                overview: {
                    summary: recordsets[0][0],
                    trend: recordsets[1],
                    topProducts: recordsets[2],
                    statusDistribution: recordsets[3]
                }
            };
        } catch (error) {
            console.error("Error fetching sales overview:", error);
            throw new Error(`Failed to fetch sales overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getUserOrders(user_id: string) {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            let result = await pool.request()
                .input("user_id", mssql.VarChar, user_id)
                .execute("getUserOrders");
                
            // Parse the JSON order_items for each order
            const orders = result.recordset.map(order => ({
                ...order,
                order_items: order.order_items ? JSON.parse(order.order_items) : []
            }));
            
            return {
                success: true,
                orders: orders
            };
        } catch (error) {
            console.error("Error fetching user orders:", error);
            throw new Error(`Failed to fetch user orders: ${(error as Error).message}`);
        }
    }
    
    async getUserMonthlySpending(user_id: string, months: number = 6) {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            let result = await pool.request()
                .input("user_id", mssql.VarChar, user_id)
                .input("months", mssql.Int, months)
                .execute("getUserMonthlySpending");
                
            return {
                success: true,
                monthlySpending: result.recordset
            };
        } catch (error) {
            console.error("Error fetching user monthly spending:", error);
            throw new Error(`Failed to fetch monthly spending: ${(error as Error).message}`);
        }
    }
    
    async getUserRecentOrders(user_id: string, limit: number = 5) {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            let result = await pool.request()
                .input("user_id", mssql.VarChar, user_id)
                .input("limit", mssql.Int, limit)
                .execute("getUserRecentOrders");
                
            // Parse the JSON order_items for each order
            const orders = result.recordset.map(order => ({
                ...order,
                order_items: order.order_items ? JSON.parse(order.order_items) : []
            }));
            
            return {
                success: true,
                orders: orders
            };
        } catch (error) {
            console.error("Error fetching user recent orders:", error);
            throw new Error(`Failed to fetch recent orders: ${(error as Error).message}`);
        }
    }
    
    async getRecommendedProducts(user_id: string, limit: number = 5) {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            let result = await pool.request()
                .input("user_id", mssql.VarChar, user_id)
                .input("limit", mssql.Int, limit)
                .execute("getRecommendedProducts");
                
            return {
                success: true,
                recommendedProducts: result.recordset
            };
        } catch (error) {
            console.error("Error fetching recommended products:", error);
            throw new Error(`Failed to fetch recommended products: ${(error as Error).message}`);
        }
    }

    async getUserPurchaseHistory(user_id: string) {
        let pool = await mssql.connect(sqlConfig);
        
        try {
            let result = await pool.request()
                .input("user_id", mssql.VarChar, user_id)
                .execute("getUserPurchaseHistory");
                
            return {
                success: true,
                purchaseHistory: result.recordset
            };
        } catch (error) {
            console.error("Error fetching user purchase history:", error);
            throw new Error(`Failed to fetch purchase history: ${(error as Error).message}`);
        }
    }
}