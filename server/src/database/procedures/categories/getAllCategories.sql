CREATE PROCEDURE getAllCategories
AS
BEGIN
    SELECT * FROM categories WHERE isDeleted = 0;
END