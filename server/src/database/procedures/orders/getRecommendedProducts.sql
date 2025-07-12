CREATE OR ALTER PROCEDURE getRecommendedProducts
    @user_id VARCHAR(255),
    @limit INT = 4
AS
BEGIN
    -- Declare variables for favorite category
    DECLARE @fav_category_id VARCHAR(255);
    DECLARE @fav_category_name VARCHAR(255);
    
    -- Get user's most purchased category
    SELECT TOP 1
        @fav_category_id = p.category_id,
        @fav_category_name = c.name
    FROM 
        order_items oi
    JOIN 
        orders o ON oi.order_id = o.id
    JOIN 
        products p ON oi.product_id = p.id
    JOIN 
        categories c ON p.category_id = c.id
    WHERE 
        o.user_id = @user_id
    GROUP BY 
        p.category_id, c.name
    ORDER BY 
        SUM(oi.quantity) DESC;
    
    -- Get top products from that category that user hasn't purchased
    SELECT TOP (@limit)
        p.*, 
        @fav_category_name AS category_name -- Adding category_name separately
    FROM 
        products p
    WHERE 
        p.category_id = @fav_category_id
    AND 
        p.isDeleted = 0
    AND 
        p.id NOT IN (
            SELECT DISTINCT oi.product_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.user_id = @user_id
        )
    ORDER BY 
        p.price DESC; -- or any other relevant ordering
END;
