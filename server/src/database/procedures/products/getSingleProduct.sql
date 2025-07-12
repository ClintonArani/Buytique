CREATE OR ALTER PROCEDURE getSingleProduct
    @id VARCHAR(255)
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
        p.id = @id AND 
        p.isDeleted = 0;
END


select * from users

delete from orders where isDelete = FALSE

select * from orders

select * from order_items