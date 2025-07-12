"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mssql_1 = __importDefault(require("mssql"));
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sqlConfig_1 = require("../config/sqlConfig");
const email_service_1 = require("./email.service");
class userService {
    async registerUser(user) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let user_id = (0, uuid_1.v4)();
        let hashedPassword = bcryptjs_1.default.hashSync(user.password, 6);
        let createdAt = new Date();
        if (pool.connected) {
            // Check if email exists
            let emailExists = (await pool.request().query(`SELECT * FROM Users WHERE email = '${user.email}'`)).recordset;
            if (!lodash_1.default.isEmpty(emailExists)) {
                return {
                    error: "Email already in use"
                };
            }
            let phoneNoExists = (await pool.request().query(`SELECT * FROM Users WHERE phoneNumber = '${user.phoneNumber}'`)).recordset;
            if (!lodash_1.default.isEmpty(phoneNoExists)) {
                return {
                    error: "Phone number already in use"
                };
            }
            let result = (await pool.request()
                .input("id", mssql_1.default.VarChar, user_id)
                .input("firstName", user.firstName)
                .input("lastName", user.lastName)
                .input("phoneNumber", user.phoneNumber)
                .input("email", user.email)
                .input("password", hashedPassword)
                .input("createdAt", mssql_1.default.DateTime, createdAt)
                .execute("registerUser")).rowsAffected;
            if (result[0] == 1) {
                return {
                    message: "Account created successfully"
                };
            }
            else {
                return {
                    error: "Unable to create Account"
                };
            }
        }
        else {
            return {
                error: "Unable to establish connection"
            };
        }
    }
    async fetchAllUsers() {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .query("SELECT * FROM Users WHERE isDelete = 0")).recordset; // Only fetch non-deleted users
        if (result.length == 0) {
            return {
                message: "No users at the moment"
            };
        }
        else {
            return {
                users: result
            };
        }
    }
    async fetchSingleUser(user_id) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = (await pool.request()
            .input("user_id", mssql_1.default.VarChar, user_id)
            .query("SELECT * FROM Users WHERE id = @user_id AND isDelete = 0")).recordset; // Only fetch if not deleted
        if (result.length === 0) {
            return {
                error: "User not found or has been deleted"
            };
        }
        else {
            return {
                user: result[0]
            };
        }
    }
    async switchRoles(user_id) {
        try {
            let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
            // Fetch the current role of the user
            let currentRoleResult = await pool.request()
                .input("user_id", mssql_1.default.VarChar, user_id)
                .query("SELECT role FROM Users WHERE id = @user_id");
            // Check if the user was found
            if (!currentRoleResult.recordset || currentRoleResult.recordset.length === 0) {
                return {
                    error: "User not found"
                };
            }
            // Determine the new role
            const currentRole = currentRoleResult.recordset[0].role;
            const newRole = (currentRole === "user") ? "admin" : "user";
            // Update the user's role
            let updateResult = await pool.request()
                .input("user_id", mssql_1.default.VarChar, user_id)
                .input("newRole", mssql_1.default.VarChar, newRole)
                .query("UPDATE Users SET role = @newRole WHERE id = @user_id");
            // Check if the update was successful
            if (updateResult.rowsAffected[0] === 1) {
                return {
                    message: "Role switched successfully"
                };
            }
            else {
                return {
                    error: "Unable to switch role"
                };
            }
        }
        catch (error) {
            // Handle the error and log it
            if (error instanceof Error) {
                console.error("Error updating user role:", error.message);
                return {
                    error: `Error updating user role: ${error.message}`
                };
            }
            else {
                console.error("Unexpected error:", error);
                return {
                    error: "Unexpected error occurred while updating user role."
                };
            }
        }
    }
    async deleteUser(user_id) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        try {
            // Update the isDelete column to 1 (true) to mark the user as deleted
            let result = await pool.request()
                .input("user_id", mssql_1.default.VarChar, user_id)
                .query("UPDATE Users SET isDelete = 1 WHERE id = @user_id");
            if (result.rowsAffected[0] === 1) {
                return {
                    message: "User deleted successfully"
                };
            }
            else {
                return {
                    error: "User not found or already deleted"
                };
            }
        }
        catch (error) {
            // Handle the error and log it
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error deleting user:", errorMessage);
            return {
                error: `Error deleting user: ${errorMessage}`
            };
        }
    }
    async updateUser(user_id, updatedUser) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        // Hash the password if it's being updated
        let hashedPassword = updatedUser.password ? bcryptjs_1.default.hashSync(updatedUser.password, 6) : undefined;
        // Prepare the SQL update query
        let query = `
            UPDATE Users SET
                firstName = @firstName,
                lastName = @lastName,
                phoneNumber = @phoneNumber,
                email = @email,
                ${hashedPassword ? 'password = @password,' : ''}
                role = @role,
                isUpdated = 1, -- Set isUpdated to 1 (true)
                updatedAt = GETDATE() -- Use GETDATE() to set updatedAt to the current timestamp
            WHERE id = @user_id
        `;
        try {
            let request = pool.request()
                .input('user_id', mssql_1.default.VarChar, user_id)
                .input('firstName', mssql_1.default.VarChar, updatedUser.firstName)
                .input('lastName', mssql_1.default.VarChar, updatedUser.lastName)
                .input('phoneNumber', mssql_1.default.VarChar, updatedUser.phoneNumber)
                .input('email', mssql_1.default.VarChar, updatedUser.email)
                .input('role', mssql_1.default.VarChar, updatedUser.role);
            if (hashedPassword) {
                request.input('password', mssql_1.default.VarChar, hashedPassword);
            }
            let result = await request.query(query);
            if (result.rowsAffected[0] === 1) {
                return {
                    message: "User updated successfully"
                };
            }
            else {
                return {
                    error: "Unable to update user"
                };
            }
        }
        catch (error) {
            // Handle error with a more generic approach
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                error: `Error updating user: ${errorMessage}`
            };
        }
    }
    async initiatePasswordReset(email) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        try {
            // Check if email exists and user is active
            let user = (await pool.request()
                .input('email', mssql_1.default.VarChar, email)
                .query('SELECT * FROM Users WHERE email = @email AND isActive = 1 AND isDelete = 0')).recordset[0];
            if (!user) {
                return { error: 'Email not found or account is inactive' };
            }
            // Generate a 6-digit reset code
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            // Initialize email service
            const emailService = new email_service_1.EmailService();
            // Store the reset code in the database
            const stored = await emailService.storeResetCode(email, resetCode);
            if (!stored) {
                return { error: 'Failed to store reset code' };
            }
            // Send the reset code via email
            const sent = await emailService.sendResetCode(email, resetCode);
            if (!sent) {
                return { error: 'Failed to send reset code' };
            }
            return { message: 'Reset code sent to your email' };
        }
        catch (error) {
            console.error('Error initiating password reset:', error);
            return { error: 'Failed to initiate password reset' };
        }
    }
    async verifyResetCode(email, resetCode) {
        try {
            const emailService = new email_service_1.EmailService();
            const isValid = await emailService.validateResetCode(email, resetCode);
            if (!isValid) {
                return { error: 'Invalid or expired reset code' };
            }
            return { message: 'Reset code verified successfully' };
        }
        catch (error) {
            console.error('Error verifying reset code:', error);
            return { error: 'Failed to verify reset code' };
        }
    }
    async resetPassword(email, resetCode, newPassword) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        try {
            // First verify the reset code
            const verification = await this.verifyResetCode(email, resetCode);
            if (verification.error) {
                return verification;
            }
            // Validate password length
            if (newPassword.length < 6) {
                return { error: 'Password must be at least 6 characters' };
            }
            // Hash the new password
            const hashedPassword = bcryptjs_1.default.hashSync(newPassword, 6);
            // Update the password in the database
            const result = await pool.request()
                .input('email', mssql_1.default.VarChar, email)
                .input('password', mssql_1.default.VarChar, hashedPassword)
                .input('updatedAt', mssql_1.default.DateTime, new Date())
                .query('UPDATE Users SET password = @password, updatedAt = @updatedAt, isUpdated = 1 WHERE email = @email');
            if (result.rowsAffected[0] === 1) {
                // Delete the used reset code
                const emailService = new email_service_1.EmailService();
                await emailService.deleteResetCode(email);
                return { message: 'Password reset successfully' };
            }
            else {
                return { error: 'Failed to reset password' };
            }
        }
        catch (error) {
            console.error('Error resetting password:', error);
            return { error: 'Failed to reset password' };
        }
    }
    // Add these methods to your userService class
    async addProfilePhoto(user_id, imageFile) {
        let pool = await mssql_1.default.connect(sqlConfig_1.sqlConfig);
        // Validate user exists first
        const userExists = (await pool.request()
            .input("user_id", mssql_1.default.VarChar, user_id)
            .query("SELECT id FROM Users WHERE id = @user_id AND isDelete = 0")).recordset[0];
        if (!userExists) {
            throw new Error("User not found or has been deleted");
        }
        if (!imageFile || !imageFile.name) {
            throw new Error("No file uploaded or file is invalid");
        }
        const imageName = `${user_id}-${Date.now()}-${imageFile.name}`;
        const imagePath = path_1.default.join(__dirname, '..', 'uploads', 'profiles', imageName);
        // Create profiles directory if it doesn't exist
        const profilesDir = path_1.default.join(__dirname, '..', 'uploads', 'profiles');
        if (!fs_1.default.existsSync(profilesDir)) {
            fs_1.default.mkdirSync(profilesDir, { recursive: true });
        }
        await imageFile.mv(imagePath);
        const relativeImagePath = `uploads/profiles/${imageName}`;
        const updatedAt = new Date();
        // Get current profile to delete old image if exists
        const currentUser = (await pool.request()
            .input("user_id", mssql_1.default.VarChar, user_id)
            .query("SELECT profile FROM Users WHERE id = @user_id")).recordset[0];
        if (pool.connected) {
            let result = (await pool.request()
                .input("user_id", mssql_1.default.VarChar, user_id)
                .input("profile", mssql_1.default.VarChar, relativeImagePath)
                .input("updatedAt", mssql_1.default.DateTime, updatedAt)
                .query("UPDATE Users SET profile = @profile, updatedAt = @updatedAt, isUpdated = 1 WHERE id = @user_id")).rowsAffected;
            if (result[0] == 1) {
                // Delete old profile photo if it exists
                if (currentUser?.profile) {
                    const oldImagePath = path_1.default.join(__dirname, '..', currentUser.profile);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
                return {
                    message: "Profile photo updated successfully",
                    userId: user_id,
                    profilePath: relativeImagePath,
                    updatedAt: updatedAt.toISOString()
                };
            }
            else {
                fs_1.default.unlinkSync(imagePath); // Delete the new image if update failed
                throw new Error("Failed to update profile photo in database");
            }
        }
        else {
            throw new Error("Database connection failed");
        }
    }
    async updateProfilePhoto(user_id, imageFile) {
        const result = await this.addProfilePhoto(user_id, imageFile);
        return {
            ...result,
            message: "Profile photo updated successfully"
        };
    }
}
exports.userService = userService;
