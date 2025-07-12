CREATE TABLE cart_items (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Foreign key referencing the users table
    product_id VARCHAR(255) NOT NULL, -- Foreign key referencing the products table
    quantity INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    isDeleted BIT DEFAULT 0,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id)
);