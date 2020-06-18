"use strict";

const nodemailer = require("nodemailer");

const S3 = require("../controllers/common/s3");
const verifyToken = require("../routes/verifyToken").verifyToken;
const Inquiry = require("../models").inquiry;
const Staff = require("../models").staff;

const Separator = "&*&*&*";

exports.sendByUser = async (req, res) => {
  try {
    const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

    const { phone, poc, title, content, type, date, username } = req.body;
    const fabricatedPhone = phone
      ? phone.replace(/\D/g, "").slice(0, 3) +
        "-" +
        phone.replace(/\D/g, "").slice(3, 7) +
        "-" +
        phone.replace(/\D/g, "").slice(7, 11)
      : "비회원";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "hzykorea.spark@gmail.com",
      to: EMAIL_ADDRESS,
      subject: "[Inquiry: " + type + "] " + (title ? title : "제목 없음"),
      html: `
                  <div style="font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                      <div><b>문의 시각:</b> ${date}</div>
                      <div><b>문의자: </b>${
                        username ? username : "비회원"
                      }님 (${fabricatedPhone})</div>
                      <div><b>연락처: </b>${poc ? poc : "기재 안함"}</div>
                      <div><b>문의 종류: </b>${type}</div>
                  </div>
                  <br/>
                  <p style="font-size: 15px;">${content}</p>
              `,
    };

    if (req.files) {
      const fileValue = Array.from(Object.values(req.files));

      // 첨부파일이 2개 이상인 경우
      if (fileValue.length > 1) {
        const option = [];

        for (let i = 0; i < fileValue.length; i++) {
          option.push({
            filename: fileValue[i].name,
            content: fileValue[i].data,
          });
        }

        mailOptions.attachments = option;
      }

      // 첨부파일이 1개인 경우
      else {
        const { file } = req.files;

        mailOptions.attachments = [
          {
            filename: file.name,
            content: file.data,
          },
        ];
      }
    }

    await transporter.sendMail(mailOptions);

    return res.status(200).send({ message: "success" });
  } catch (err) {
    console.log(err);
    res
      .status(403)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.createByUser = async (req, res) => {
  try {
    // 이메일 필수
    const { phone, poc, title, content, type } = req.body;
    const fabricatedPhone = phone
      ? phone.replace(/\D/g, "").slice(0, 3) +
        "-" +
        phone.replace(/\D/g, "").slice(3, 7) +
        "-" +
        phone.replace(/\D/g, "").slice(7, 11)
      : "비회원";

    const s3Path = `inquiry/${
      new Date().getTime() + Math.floor(Math.random() * 899 + 100)
    }`;
    let flag = true;
    let fileList = null;

    if (req.files) {
      const fileValue = Array.from(Object.values(req.files));

      // 첨부파일이 2개 이상인 경우
      if (fileValue.length > 1) {
        const upload = fileValue.map((file) =>
          S3.uploadFile(file.data, `${s3Path}/${file.name}`)
        );
        await Promise.all(upload);
      }

      // 첨부파일이 1개인 경우
      else {
        const { file } = req.files;
        flag = await S3.uploadFile(
          file.data,
          file.mimetype,
          `${s3Path}/${file.name}`
        );
      }

      fileList = await S3.getFileList(s3Path);
    }
    if (flag) {
      await Inquiry.create({
        account_id: await verifyToken(req.headers.authorization, "user"),
        phone: fabricatedPhone,
        email: poc,
        type,
        title,
        content,
        attachment: fileList
          ? fileList.map((file) => file.Key).join(Separator)
          : null,
      });

      return res.status(200).send();
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

exports.readByAdmin = async (req, res) => {
  try {
    const { inquiry_id } = req.query;

    const inquiry = await Inquiry.findOne({
      where: { id: inquiry_id },
      attributes: { exclude: ["updatedAt"] },
    });

    let staff = null;
    if (inquiry.dataValues.staff_id) {
      staff = await Staff.findOne({
        where: { id: inquiry.dataValues.staff_id },
        attributes: ["name"],
      });
    }

    return res.status(200).send({
      inquiry,
      staff,
      separator: Separator,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

exports.updateByAdmin = async (req, res) => {
  try {
    const { inquiry_id } = req.body;
    const { staff_id } = req;

    const data = {};
    data["staff_id"] = staff_id;
    if (req.body.status) data["status"] = req.body.status;

    await Inquiry.update(data, {
      where: { id: inquiry_id },
    });

    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};
