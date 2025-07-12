import { Request, Response } from "express";
import { extendedRequest } from "../middlewares/verifyToken";
import { authService } from "../services/auth.service";

let service = new authService();

export class authController {
    async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const response = await service.login({ email, password });

            if (response.error) {
                return res.status(401).json({ error: response.error });
            }

            return res.status(200).json(response);
        } catch (error) {
            console.error("Error occurred in loginUser:", error);
            return res.status(500).json({ error: "An internal server error occurred" });
        }
    }

    async checkDetails(req: extendedRequest, res: Response) {
        try {
            if (req.info) {
                return res.status(200).json({
                    info: req.info
                });
            } else {
                return res.status(404).json({ error: "No details found" });
            }
        } catch (error) {
            console.error("Error occurred in checkDetails:", error);
            return res.status(500).json({ error: "An internal server error occurred" });
        }
    }
    async logoutUser(req: extendedRequest, res: Response) {
        try {
            const userId = req.info?.id; // Assuming the user ID is in the token
            if (!userId) {
                return res.status(401).json({ error: "User ID not found" });
            }
    
            const response = await service.logout(userId);
            return res.status(200).json(response);
        } catch (error) {
            console.error("Error occurred in logoutUser:", error);
            return res.status(500).json({ error: "An internal server error occurred" });
        }
    }
}
