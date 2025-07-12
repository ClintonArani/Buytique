import mssql from 'mssql';
import { v4 } from 'uuid';
import { CartItem } from '../interfaces/cart-item.interface';
import { sqlConfig } from '../config/sqlConfig';

export class CartItemService {
    async addCartItem(cartItem: CartItem) {
        let pool = await mssql.connect(sqlConfig);
        let transaction = new mssql.Transaction(pool);
        
        try {
            await transaction.begin();
            
            let cart_item_id = v4();
            let createdAt = new Date();
    
            // 1. First check if product has enough stock
            const productResult = await new mssql.Request(transaction)
                .input("product_id", mssql.VarChar, cartItem.product_id)
                .query("SELECT stock_quantity FROM products WHERE id = @product_id AND isDeleted = 0");
    
            if (productResult.recordset.length === 0) {
                await transaction.rollback();
                return { error: "Product not found" };
            }
    
            const currentStock = productResult.recordset[0].stock_quantity;
            if (currentStock < cartItem.quantity) {
                await transaction.rollback();
                return { error: `Not enough stock. Only ${currentStock} available` };
            }
    
            // 2. Add to cart
            let cartResult = await new mssql.Request(transaction)
                .input("id", mssql.VarChar, cart_item_id)
                .input("user_id", mssql.VarChar, cartItem.user_id)
                .input("product_id", mssql.VarChar, cartItem.product_id)
                .input("quantity", mssql.Int, cartItem.quantity)
                .input("createdAt", mssql.DateTime, createdAt)
                .execute("addCartItem");
    
            if (cartResult.rowsAffected[0] !== 1) {
                await transaction.rollback();
                return { error: "Unable to add item to cart" };
            }
    
            // 3. Update product stock
            const newStock = currentStock - cartItem.quantity;
            await new mssql.Request(transaction)
                .input("product_id", mssql.VarChar, cartItem.product_id)
                .input("quantity", mssql.Int, newStock)
                .query("UPDATE products SET stock_quantity = @quantity WHERE id = @product_id");
    
            await transaction.commit();
            
            return {
                message: "Item added to cart successfully",
                remainingStock: newStock
            };
        } catch (error) {
            await transaction.rollback();
            console.error("Error in addCartItem:", error);
            return {
                error: "An error occurred while adding item to cart"
            };
        } finally {
            pool.close();
        }
    }

    async removeCartItem(cart_item_id: string) {
        let pool = await mssql.connect(sqlConfig);
        let transaction = new mssql.Transaction(pool);
        
        try {
            await transaction.begin();
    
            // 1. First get the cart item details
            const cartItemResult = await new mssql.Request(transaction)
                .input("id", mssql.VarChar, cart_item_id)
                .query("SELECT product_id, quantity FROM cart_items WHERE id = @id");
    
            if (cartItemResult.recordset.length === 0) {
                await transaction.rollback();
                return { error: "Cart item not found" };
            }
    
            const { product_id, quantity } = cartItemResult.recordset[0];
    
            // 2. Remove from cart
            let result = await new mssql.Request(transaction)
                .input("id", mssql.VarChar, cart_item_id)
                .execute("removeCartItem");
    
            if (result.rowsAffected[0] !== 1) {
                await transaction.rollback();
                return { error: "Unable to remove item from cart" };
            }
    
            // 3. Restore product stock
            await new mssql.Request(transaction)
                .input("product_id", mssql.VarChar, product_id)
                .input("quantity", mssql.Int, quantity)
                .query("UPDATE products SET stock_quantity = stock_quantity + @quantity WHERE id = @product_id");
    
            await transaction.commit();
            
            return {
                message: "Item removed from cart successfully"
            };
        } catch (error) {
            await transaction.rollback();
            console.error("Error in removeCartItem:", error);
            return {
                error: "An error occurred while removing item from cart"
            };
        } finally {
            pool.close();
        }
    }

    async getCartItems(user_id: string) {
        let pool = await mssql.connect(sqlConfig);

        let result = (await pool.request()
            .input("user_id", mssql.VarChar, user_id)
            .execute("getCartItems")).recordset;

        if (result.length == 0) {
            return {
                message: "No items in the cart"
            };
        } else {
            return {
                cartItems: result
            };
        }
    }
}