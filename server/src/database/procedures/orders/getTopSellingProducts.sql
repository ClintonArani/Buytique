CREATE PROCEDURE getTopSellingProducts
    @limit INT = 10
AS
BEGIN
    SELECT TOP (@limit)
        p.id AS product_id,
        p.name AS product_name,
        p.image_path,
        SUM(oi.quantity) AS total_quantity_sold,
        SUM(oi.quantity * oi.price) AS total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.isDeleted = 0 AND p.isDeleted = 0
    GROUP BY p.id, p.name, p.image_path
    ORDER BY total_quantity_sold DESC;
END

