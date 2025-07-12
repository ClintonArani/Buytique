CREATE PROCEDURE checkout
    @user_id VARCHAR(255)
AS
BEGIN
    DECLARE @order_id VARCHAR(255) = NEWID();
    DECLARE @total_price DECIMAL(10, 2) = 0;
    DECLARE @createdAt DATETIME = GETDATE();

    -- Calculate the total price of the cart
    SELECT @total_price = SUM(p.price * ci.quantity)
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = @user_id AND ci.isDeleted = 0;

    -- Insert the order
    INSERT INTO orders (id, user_id, total_price, createdAt)
    VALUES (@order_id, @user_id, @total_price, @createdAt);

    -- Move cart items to order items
    INSERT INTO order_items (id, order_id, product_id, quantity, price, createdAt)
    SELECT NEWID(), @order_id, ci.product_id, ci.quantity, p.price, @createdAt
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = @user_id AND ci.isDeleted = 0;

    -- Update product stock quantities
    UPDATE products
    SET stock_quantity = stock_quantity - ci.quantity
    FROM cart_items ci
    WHERE products.id = ci.product_id AND ci.user_id = @user_id AND ci.isDeleted = 0;

    -- Clear the user's cart
    UPDATE cart_items
    SET isDeleted = 1
    WHERE user_id = @user_id AND isDeleted = 0;

    -- Return the order details
    SELECT * FROM orders WHERE id = @order_id;
END