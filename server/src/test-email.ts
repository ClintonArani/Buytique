import nodemailer from 'nodemailer';

const testEmail = async () => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        await transporter.verify();
        console.log('Server is ready to take our messages');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'This is a test email'
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending test email:', error);
    }
};

testEmail();