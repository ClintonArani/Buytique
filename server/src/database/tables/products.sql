CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_path VARCHAR(255), -- Store the file path of the uploaded image
    stock_quantity INT NOT NULL,
    category_id VARCHAR(255), -- Foreign key referencing the categories table
    isDeleted BIT DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id)
);


