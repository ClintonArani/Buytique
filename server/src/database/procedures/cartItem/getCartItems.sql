CREATE OR ALTER PROCEDURE getCartItems
    @user_id VARCHAR(255)
AS
BEGIN
    SELECT 
        ci.id, 
        ci.product_id, 
        ci.quantity, 
        p.name, 
        p.price, 
        p.image_path,
        c.id AS category_id,
        c.name AS category_name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ci.user_id = @user_id AND ci.isDeleted = 0;
END