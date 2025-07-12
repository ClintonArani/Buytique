CREATE PROCEDURE addCategory
    @id VARCHAR(255),
    @name VARCHAR(255),
    @description TEXT,
    @createdAt DATETIME
AS
BEGIN
    INSERT INTO categories (id, name, description, createdAt)
    VALUES (@id, @name, @description, @createdAt);
END