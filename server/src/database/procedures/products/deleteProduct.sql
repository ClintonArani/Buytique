CREATE PROCEDURE deleteProduct
    @id VARCHAR(255)
AS
BEGIN
    UPDATE products
    SET isDeleted = 1
    WHERE id = @id;
END