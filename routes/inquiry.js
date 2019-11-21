const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const verifyToken = require("./verifyToken");

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

router.post("/mail", verifyToken, asyncHandler(async (req, res) => {
    try {
        const { phone, title, content, type } = req.body;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: EMAIL_ADDRESS,
                pass: EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: "hzykorea.spark@gmail.com",
            to: EMAIL_ADDRESS,
            subject: title,
            html: `
                <div style="font-size: 15px;">
                    <div>연락처: ${phone}</div>
                    <br/>
                    <div>문의 종류: ${type}</div>
                    <br/>
                    <p>${content}</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions);

        res.status(201).send({ message: "success" });
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

module.exports = router;