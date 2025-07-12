CREATE PROCEDURE getSalesOverview
AS
BEGIN
    -- 1. Total Sales Metrics
    DECLARE @totalRevenue DECIMAL(10,2)
    DECLARE @totalOrders INT
    DECLARE @avgOrderValue DECIMAL(10,2)
    
    SELECT 
        @totalRevenue = SUM(total_price),
        @totalOrders = COUNT(*),
        @avgOrderValue = AVG(total_price)
    FROM orders
    WHERE isDeleted = 0;
    
    -- 2. Recent Sales Trend (last 7 days)
    SELECT 
        CAST(order_date AS DATE) AS date,
        COUNT(*) AS order_count,
        SUM(total_price) AS daily_revenue
    INTO #recentTrend
    FROM orders
    WHERE isDeleted = 0 
    AND order_date >= DATEADD(day, -7, GETDATE())
    GROUP BY CAST(order_date AS DATE)
    ORDER BY date;
    
    -- 3. Top Selling Products (by revenue)
    SELECT TOP 5
        p.name AS product_name,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.quantity * oi.price) AS revenue
    INTO #topProducts
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.isDeleted = 0
    GROUP BY p.name
    ORDER BY revenue DESC;
    
    -- 4. Order Status Distribution
    SELECT 
        order_status,
        COUNT(*) AS count
    INTO #statusDistribution
    FROM orders
    WHERE isDeleted = 0
    GROUP BY order_status;
    
    -- Return all results
    SELECT 
        'summary' AS result_type,
        @totalRevenue AS total_revenue,
        @totalOrders AS total_orders,
        @avgOrderValue AS avg_order_value;
    
    SELECT 
        'trend' AS result_type,
        date,
        order_count,
        daily_revenue
    FROM #recentTrend;
    
    SELECT 
        'top_products' AS result_type,
        product_name,
        units_sold,
        revenue
    FROM #topProducts;
    
    SELECT 
        'status_distribution' AS result_type,
        order_status,
        count
    FROM #statusDistribution;
    
    -- Clean up
    DROP TABLE #recentTrend;
    DROP TABLE #topProducts;
    DROP TABLE #statusDistribution;
END