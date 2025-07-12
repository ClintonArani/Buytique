CREATE TABLE order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL, -- Foreign key referencing the orders table
    product_id VARCHAR(255) NOT NULL, -- Foreign key referencing the products table
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    isDeleted BIT DEFAULT 0,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_product_order FOREIGN KEY (product_id) REFERENCES products(id)
);