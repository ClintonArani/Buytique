CREATE PROCEDURE addProduct
    @id VARCHAR(255),
    @name VARCHAR(255),
    @description TEXT,
    @price DECIMAL(10, 2),
    @image_path VARCHAR(255),
    @stock_quantity INT,
    @category_id VARCHAR(255),
    @createdAt DATETIME
AS
BEGIN
    INSERT INTO products (id, name, description, price, image_path, stock_quantity, category_id, createdAt)
    VALUES (@id, @name, @description, @price, @image_path, @stock_quantity, @category_id, @createdAt);
END
