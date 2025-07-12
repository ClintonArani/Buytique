import nodemailer from 'nodemailer';
import { sqlConfig } from '../config/sqlConfig';
import mssql from 'mssql';
import { v4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure SMTP transporter (Gmail)
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // Verify SMTP connection
        this.verifyConnection();
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP Server is ready to send emails');
        } catch (error) {
            console.error('❌ SMTP Connection failed:', error);
        }
    }

    // 📩 Send password reset email
    async sendResetCode(email: string, resetCode: string): Promise<boolean> {
        try {
            const mailOptions = {
                from: `"Password Reset" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Password Reset Code',
                html: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2>Password Reset Request</h2>
                        <p>Your verification code is: <strong>${resetCode}</strong></p>
                        <p>This code expires in 15 minutes.</p>
                    </div>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Reset code sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send reset code:', error);
            return false;
        }
    }

    // 📌 Store reset code securely with proper expiration handling
    async storeResetCode(email: string, resetCode: string): Promise<boolean> {
        let pool = await mssql.connect(sqlConfig);

        try {
            // Delete any existing reset codes for the email
            await pool.request()
                .input('email', mssql.VarChar, email)
                .query('DELETE FROM PasswordResetCodes WHERE email = @email');

            // Set expiration time (15 minutes from now) in **UTC**
            const expirationTime = new Date(Date.now() + 15 * 60 * 1000);
            
            console.log(`Storing reset code for ${email} with expiration at: ${expirationTime.toISOString()}`);

            await pool.request()
                .input('id', mssql.VarChar, v4())
                .input('email', mssql.VarChar, email)
                .input('resetCode', mssql.VarChar, resetCode)
                .input('expirationTime', mssql.DateTime, expirationTime)
                .query(`
                    INSERT INTO PasswordResetCodes (id, email, resetCode, expirationTime)
                    VALUES (@id, @email, @resetCode, @expirationTime)
                `);

            return true;
        } catch (error) {
            console.error('❌ Failed to store reset code:', error);
            return false;
        }
    }

    // ✅ Validate reset code before allowing password reset
    async validateResetCode(email: string, resetCode: string): Promise<boolean> {
        let pool = await mssql.connect(sqlConfig);

        try {
            const result = await pool.request()
                .input('email', mssql.VarChar, email.trim())
                .input('resetCode', mssql.VarChar, resetCode.trim())
                .query(`
                    SELECT * FROM PasswordResetCodes 
                    WHERE email = @email 
                    AND resetCode = @resetCode 
                    AND expirationTime > GETUTCDATE()  -- Ensure it's not expired
                `);

            console.log(`🔍 Validation result for ${email}: ${result.recordset.length} matches found`);

            return result.recordset.length > 0;
        } catch (error) {
            console.error('❌ Validation error:', error);
            return false;
        }
    }

    // 🗑️ Delete used or expired reset codes
    async deleteResetCode(email: string): Promise<void> {
        let pool = await mssql.connect(sqlConfig);

        try {
            await pool.request()
                .input('email', mssql.VarChar, email)
                .query('DELETE FROM PasswordResetCodes WHERE email = @email');

            console.log(`🗑️ Reset code deleted for ${email}`);
        } catch (error) {
            console.error('❌ Failed to delete reset code:', error);
        }
    }
}
