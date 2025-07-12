import mssql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { login_details } from '../interfaces/user.interface';
import { sqlConfig } from '../config/sqlConfig';

export class authService {
    async login(logins: login_details) {
        let pool = await mssql.connect(sqlConfig);

        let user = (await pool.request()
            .input("email", logins.email)
            .input("password", logins.password)
            .execute("loginUser")).recordset;

        if (user.length < 1) {
            return {
                error: "User not found"
            };
        } else {
            let hashedPassword = user[0].password;

            // Compare password
            let passwordMatches = bcrypt.compareSync(logins.password, hashedPassword);

            if (passwordMatches) {
                // Update isActive to 1 (true) when the user logs in
                await pool.request()
                    .input("id", user[0].id)
                    .query("UPDATE users SET isActive = 1 WHERE id = @id");

                let { createdAt, password, phoneNumber, isActive, isDelete, ...rest } = user[0];

                let token = jwt.sign(rest, process.env.SECRET_KEY as string, {
                    expiresIn: '2h'
                });

                return {
                    message: "Logged in successfully",
                    token
                };
            } else {
                return {
                    error: "Incorrect password"
                };
            }
        }
    }
    async logout(userId: string) {
        let pool = await mssql.connect(sqlConfig);
    
        await pool.request()
            .input("id", userId)
            .query("UPDATE users SET isActive = 0 WHERE id = @id");
    
        return {
            message: "Logged out successfully"
        };
    }
}