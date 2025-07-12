-- Get user's orders
CREATE PROCEDURE getUserOrders
    @user_id VARCHAR(255)
AS
BEGIN
    SELECT 
        o.id, 
        o.user_id, 
        o.total_price, 
        o.createdAt, 
        o.order_status,
        (
            SELECT 
                p.name AS product_name,
                p.price AS unit_price,
                oi.quantity,
                (p.price * oi.quantity) AS item_total,
                p.image_path
            FROM 
                order_items oi
            JOIN 
                products p ON oi.product_id = p.id
            WHERE 
                oi.order_id = o.id
            FOR JSON PATH
        ) AS order_items
    FROM 
        orders o
    WHERE 
        o.user_id = @user_id
    AND 
        o.isDeleted = 0
    ORDER BY 
        o.createdAt DESC;
END;


