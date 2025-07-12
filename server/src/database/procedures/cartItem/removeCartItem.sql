CREATE PROCEDURE removeCartItem
    @id VARCHAR(255)
AS
BEGIN
    UPDATE cart_items
    SET isDeleted = 1
    WHERE id = @id;
END