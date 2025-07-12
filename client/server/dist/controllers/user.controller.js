"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("../services/user.service");
const user_validator_1 = require("../validators/user.validator");
let service = new user_service_1.userService();
class userController {
    async createUser(req, res) {
        try {
            console.log('Request Body:', req.body);
            let { firstName, lastName, phoneNumber, email, password } = req.body;
            let { error } = user_validator_1.userSchema.validate(req.body);
            if (error) {
                return res.status(401).json({
                    error: error.message
                });
            }
            let result = await service.registerUser(req.body);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.json({
                error
            });
        }
    }
    async fetchAll(req, res) {
        try {
            let result = await service.fetchAllUsers();
            return res.status(201).json(result);
        }
        catch (error) {
            return res.json({
                error
            });
        }
    }
    async fetchSingleUser(req, res) {
        try {
            let { user_id } = req.params;
            let response = await service.fetchSingleUser(user_id);
            return res.json(response);
        }
        catch (error) {
            return res.json({
                error
            });
        }
    }
    async switchRoles(req, res) {
        try {
            const { user_id } = req.body;
            // Ensure user_id is provided
            if (!user_id) {
                return res.status(400).json({ error: "User ID is required" });
            }
            const response = await service.switchRoles(user_id);
            // Handle the response from the service
            if (response.error) {
                return res.status(500).json({ error: response.error });
            }
            return res.status(200).json(response);
        }
        catch (error) {
            // Handle unexpected errors
            if (error instanceof Error) {
                console.error("Error in switchRoles controller:", error.message);
                return res.status(500).json({ error: `Error in switchRoles controller: ${error.message}` });
            }
            else {
                console.error("Unexpected error in switchRoles controller:", error);
                return res.status(500).json({ error: "Unexpected error occurred while switching roles." });
            }
        }
    }
    async updateUser(req, res) {
        try {
            let { user_id } = req.params;
            let updatedUser = req.body;
            let result = await service.updateUser(user_id, updatedUser);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            // Handle errors here with a more generic approach
            const errorMessage = error instanceof Error ? error.message : 'Internal server error';
            return res.status(500).json({
                error: `Internal server error: ${errorMessage}`
            });
        }
    }
    async deleteUser(req, res) {
        try {
            let { user_id } = req.params;
            // Call the deleteUser method from the service
            let result = await service.deleteUser(user_id);
            if (result.error) {
                return res.status(404).json(result); // User not found or already deleted
            }
            return res.status(200).json(result); // User deleted successfully
        }
        catch (error) {
            // Handle unexpected errors
            const errorMessage = error instanceof Error ? error.message : 'Internal server error';
            return res.status(500).json({
                error: `Internal server error: ${errorMessage}`
            });
        }
    }
    async initiatePasswordReset(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const result = await service.initiatePasswordReset(email);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in initiatePasswordReset:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async verifyResetCode(req, res) {
        try {
            const { email, resetCode } = req.body;
            if (!email || !resetCode) {
                return res.status(400).json({ error: 'Email and reset code are required' });
            }
            const result = await service.verifyResetCode(email, resetCode);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in verifyResetCode:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async resetPassword(req, res) {
        try {
            const { email, resetCode, newPassword } = req.body;
            if (!email || !resetCode || !newPassword) {
                return res.status(400).json({ error: 'Email, reset code and new password are required' });
            }
            const result = await service.resetPassword(email, resetCode, newPassword);
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in resetPassword:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async addProfilePhoto(req, res) {
        try {
            let { user_id } = req.params;
            if (!req.files || !req.files.profilePhoto) {
                return res.status(400).json({
                    error: "Profile photo file is required",
                    userId: user_id
                });
            }
            const profilePhoto = req.files.profilePhoto;
            let result = await service.addProfilePhoto(user_id, profilePhoto);
            return res.status(200).json({
                ...result,
                userId: user_id // Explicitly include user ID in response
            });
        }
        catch (error) {
            console.error(`Error updating profile for user ${req.params.user_id}:`, error);
            return res.status(500).json({
                error: error.message,
                userId: req.params.user_id,
                message: "Failed to update profile photo"
            });
        }
    }
    async updateProfilePhoto(req, res) {
        try {
            let { user_id } = req.params;
            if (!req.files || !req.files.profilePhoto) {
                return res.status(400).json({
                    error: "Profile photo file is required for update",
                    userId: user_id
                });
            }
            const profilePhoto = req.files.profilePhoto;
            let result = await service.updateProfilePhoto(user_id, profilePhoto);
            return res.status(200).json({
                ...result,
                userId: user_id,
                action: "update" // Explicitly indicate this was an update
            });
        }
        catch (error) {
            console.error(`Error updating profile photo for user ${req.params.user_id}:`, error);
            return res.status(500).json({
                error: error.message,
                userId: req.params.user_id,
                action: "update",
                message: "Failed to update profile photo"
            });
        }
    }
}
exports.userController = userController;
