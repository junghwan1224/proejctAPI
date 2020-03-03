// const express = require("express");
// const router = express.Router();
// const nodemailer = require("nodemailer");
// const asyncHandler = require("express-async-handler");
// const verifyToken = require("./verifyToken");

// const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
// const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// router.post(
//   "/mail",
//   //   verifyToken,
//   asyncHandler(async (req, res) => {
//     try {
//       const { phone, poc, title, content, type, date, username } = req.body;
//       const fabricatedPhone =
//         phone.replace(/\D/g, "").slice(0, 3) +
//         "-" +
//         phone.replace(/\D/g, "").slice(3, 7) +
//         "-" +
//         phone.replace(/\D/g, "").slice(7, 11);

//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         host: "smtp.gmail.com",
//         port: 465,
//         secure: true,
//         auth: {
//           user: EMAIL_ADDRESS,
//           pass: EMAIL_PASSWORD
//         }
//       });

//       const mailOptions = {
//         from: "hzykorea.spark@gmail.com",
//         to: EMAIL_ADDRESS,
//         subject: "[Inquiry: " + type + "] " + (title ? title : "제목 없음"),
//         html: `
//                 <div style="font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
//                     <div><b>문의 시각:</b> ${date}</div>
//                     <div><b>문의자: </b>${username}님 (${fabricatedPhone})</div>
//                     <div><b>연락처: </b>${poc ? poc : "기재 안함"}</div>
//                     <div><b>문의 종류: </b>${type}</div>
//                 </div>
//                 <br/>
//                 <p style="font-size: 15px;">${content}</p>
//             `
//       };

//       if(req.files) {
//         const fileValue = Array.from(Object.values(req.files));

//         // 첨부파일이 2개 이상인 경우
//         if(fileValue.length > 1) {
//           const option = [];

//           for(let i=0; i<fileValue.length; i++) {
//             option.push({
//               filename: fileValue[i].name,
//               content: fileValue[i].data
//             });
//           }

//           mailOptions.attachments = option;
//         }

//         // 첨부파일이 1개인 경우
//         else {
//           const { file } = req.files;

//           mailOptions.attachments = [
//             {
//               filename: file.name,
//               content: file.data,
//             }
//           ];
//         }
//       }

//       await transporter.sendMail(mailOptions);

//       return res.status(200).send({ message: "success" });
//     } catch (err) {
//       console.log(err);
//       res
//         .status(403)
//         .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
//     }
//   })
// );

// module.exports = router;
