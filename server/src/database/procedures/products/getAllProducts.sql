CREATE OR ALTER PROCEDURE getAllProducts
AS
BEGIN
    SELECT 
        p.*,
        c.name AS category_name
    FROM 
        products p
    LEFT JOIN 
        categories c ON p.category_id = c.id
    WHERE 
        p.isDeleted = 0;
END

