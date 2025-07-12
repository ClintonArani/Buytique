CREATE PROCEDURE deleteCategory
    @id VARCHAR(255)
AS
BEGIN
    UPDATE categories
    SET isDeleted = 1
    WHERE id = @id;
END