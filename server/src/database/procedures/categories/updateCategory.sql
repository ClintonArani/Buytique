CREATE PROCEDURE updateCategory
    @id VARCHAR(255),
    @name VARCHAR(255),
    @description TEXT,
    @updatedAt DATETIME
AS
BEGIN
    UPDATE categories
    SET name = @name,
        description = @description,
        updatedAt = @updatedAt
    WHERE id = @id;
END