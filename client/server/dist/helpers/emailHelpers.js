"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function createTransporter(configs) {
    const transporter = nodemailer_1.default.createTransport(configs);
    return transporter;
}
let mailConfigurations = ({
    // service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    requireTLS: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
const sendMail = async (messageOptions) => {
    const transporter = createTransporter(mailConfigurations);
    await transporter.verify();
    await transporter.sendMail(messageOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(info.response);
        }
    });
};
exports.sendMail = sendMail;
