CREATE PROCEDURE addToCart
    @id VARCHAR(255),
    @user_id VARCHAR(255),
    @createdAt DATETIME
AS
BEGIN
    INSERT INTO cart (id, user_id, createdAt)
    VALUES (@id, @user_id, @createdAt);
END