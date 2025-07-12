CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    isDeleted BIT DEFAULT 0
);
