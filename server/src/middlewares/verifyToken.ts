import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { token_datails } from "../interfaces/user.interface";
import { sqlConfig } from "../config/sqlConfig";
import mssql from 'mssql'

// Extend the Express Request interface to include token details
export interface extendedRequest extends Request {
    info?: token_datails;
}

// Middleware to verify JWT token
export const verifyToken = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                error: "Authorization header is missing"
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: "Token is missing"
            });
        }

        try {
            const data = jwt.verify(token, process.env.SECRET_KEY as string) as token_datails;
            req.info = data;

            // Add a check for isActive
            let pool = await mssql.connect(sqlConfig);
            let user = (await pool.request()
                .input("id", data.id)
                .query("SELECT isActive FROM users WHERE id = @id")).recordset[0];

            if (!user.isActive) {
                return res.status(401).json({
                    error: "User is not active"
                });
            }

            next();
        } catch (err) {
            return res.status(401).json({
                error: "Invalid or expired token"
            });
        }
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({
            error: "Authentication failed"
        });
    }
};