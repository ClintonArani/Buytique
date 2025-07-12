CREATE PROCEDURE updateProduct
    @id VARCHAR(255),
    @name VARCHAR(255),
    @description TEXT,
    @price DECIMAL(10, 2),
    @image_path VARCHAR(255),
    @stock_quantity INT,
    @category_id VARCHAR(255),
    @updatedAt DATETIME
AS
BEGIN
    UPDATE products
    SET name = @name,
        description = @description,
        price = @price,
        image_path = @image_path,
        stock_quantity = @stock_quantity,
        category_id = @category_id,
        updatedAt = @updatedAt
    WHERE id = @id AND isDeleted = 0;
END


drop procedure updateproduct