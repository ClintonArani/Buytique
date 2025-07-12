CREATE PROCEDURE cancelOrder
    @order_id VARCHAR(255)
AS
BEGIN
    -- Update the order status to "cancelled"
    UPDATE orders
    SET order_status = 'cancelled'
    WHERE id = @order_id;

    -- Restore the product stock quantities
    UPDATE products
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi
    WHERE products.id = oi.product_id AND oi.order_id = @order_id;

    -- Return the updated order
    SELECT * FROM orders WHERE id = @order_id;
END