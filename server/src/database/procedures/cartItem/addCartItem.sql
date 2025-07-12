CREATE PROCEDURE addCartItem
    @id VARCHAR(255),
    @user_id VARCHAR(255),
    @product_id VARCHAR(255),
    @quantity INT,
    @createdAt DATETIME
AS
BEGIN
    INSERT INTO cart_items (id, user_id, product_id, quantity, createdAt)
    VALUES (@id, @user_id, @product_id, @quantity, @createdAt);
END