CREATE PROCEDURE getUserPurchaseHistory
    @user_id VARCHAR(255)
AS
BEGIN
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        -- CAST description to VARCHAR(MAX) for compatibility
        CAST(p.description AS VARCHAR(MAX)) AS description,
        p.price,
        p.image_path,
        SUM(oi.quantity) AS total_quantity_purchased,
        COUNT(DISTINCT o.id) AS times_ordered,
        MAX(o.order_date) AS last_purchased_date
    FROM 
        order_items oi
    JOIN 
        orders o ON oi.order_id = o.id
    JOIN 
        products p ON oi.product_id = p.id
    WHERE 
        o.user_id = @user_id
    AND 
        o.isDeleted = 0
    GROUP BY 
        p.id, 
        p.name, 
        -- Include the CAST in GROUP BY
        CAST(p.description AS VARCHAR(MAX)),
        p.price, 
        p.image_path
    ORDER BY 
        total_quantity_purchased DESC;
END;