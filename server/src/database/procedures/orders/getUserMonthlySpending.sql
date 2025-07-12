CREATE PROCEDURE getUserMonthlySpending
    @user_id VARCHAR(255),
    @months INT = 6
AS
BEGIN
    DECLARE @startDate DATE = DATEADD(MONTH, -@months, GETDATE());
    
    SELECT 
        YEAR(o.order_date) AS year,
        MONTH(o.order_date) AS month,
        SUM(o.total_price) AS total_spending,
        COUNT(o.id) AS order_count
    FROM 
        orders o
    WHERE 
        o.user_id = @user_id
    AND 
        o.order_date >= @startDate
    AND 
        o.isDeleted = 0
    GROUP BY 
        YEAR(o.order_date),
        MONTH(o.order_date)
    ORDER BY 
        year DESC, 
        month DESC;
END;


