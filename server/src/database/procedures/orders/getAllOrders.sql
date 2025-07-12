CREATE OR ALTER PROCEDURE getAllOrders
AS
BEGIN
    SELECT 
        id,
        user_id,
        total_price,
        order_status,
        CONVERT(VARCHAR, order_date, 120) AS order_date
        -- Other fields you need
    FROM orders
    WHERE isDeleted = 0;
END
