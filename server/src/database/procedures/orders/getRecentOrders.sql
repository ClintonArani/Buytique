CREATE OR ALTER PROCEDURE getRecentOrders
    @limit INT = 10
AS
BEGIN
    SELECT TOP (@limit)
        o.id AS order_id,
        o.user_id,
        u.firstName + ' ' + u.lastName AS customer_name, -- Add customer name
        u.email AS customer_email,
        o.total_price,
        o.order_status,
        o.order_date,
        (
            SELECT 
                p.name AS product_name,
                p.image_path AS product_image, -- Optional: include product image
                oi.quantity,
                oi.price AS unit_price,
                (oi.quantity * oi.price) AS item_total
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = o.id
            FOR JSON PATH
        ) AS order_items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.isDeleted = 0
    ORDER BY o.order_date DESC;
END