CREATE PROCEDURE updateOrderStatus
    @order_id VARCHAR(255),
    @new_status VARCHAR(50)
AS
BEGIN
    -- Update the order status
    UPDATE orders
    SET order_status = @new_status
    WHERE id = @order_id;

    -- Return the updated order
    SELECT * FROM orders WHERE id = @order_id;
END