CREATE PROCEDURE getSingleCategory
    @id VARCHAR(255)
AS
BEGIN
    SELECT * FROM categories WHERE id = @id AND isDeleted = 0;
END