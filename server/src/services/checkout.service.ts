import mssql from 'mssql';
import { Order } from '../interfaces/order.interface';
import { sqlConfig } from '../config/sqlConfig';

export class CheckoutService {
    async checkout(user_id: string) {
        let pool = await mssql.connect(sqlConfig);

        try {
            let result = (await pool.request()
                .input("user_id", mssql.VarChar, user_id)
                .execute("checkout")).recordset;

            if (result.length > 0) {
                return {
                    message: "Checkout successful",
                    order: result[0]
                };
            } else {
                return {
                    error: "Unable to complete checkout"
                };
            }
        } catch (error) {
            throw error;
        }
    }
}