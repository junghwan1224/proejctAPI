"use strict";

const sendSMS = require("./common/sendSMS");
const S3 = require("./common/s3");
const deleteUploadedFiles = require("./common/deleteUploadedFiles");

const Account = require("../models").account;

const S3Url =
  "https://montar-static-resources.s3.ap-northeast-2.amazonaws.com/";

// 인증번호 발급
exports.issueNumber = async (req, res) => {
  try {
    const { phone } = req.body;

    // 6자리 인증번호 생성
    const certifyNumber = Math.floor(Math.random() * 899999 + 100000);

    // 인증번호 세션에 저장
    const sess = req.session;
    sess.certifyNumber = certifyNumber;

    req.session.save((err) => {
      if (err) {
        console.log("session error");
        console.log(err);
      }
    });

    // SMS 전송
    const timestamp = new Date().getTime().toString();
    const text = `MONTAR 인증번호 [${certifyNumber}]를 입력해주세요.`;

    await sendSMS(text, phone, timestamp);

    return res.status(200).send({ message: "인증번호가 발송되었습니다." });
  } catch (err) {
    return res.status(400).send();
  }
};

// 인증
exports.check = async (req, res) => {
  try {
    const { certifyNumber } = req.body;

    if (parseInt(certifyNumber) === req.session.certifyNumber) {
      req.session.destroy((err) => {
        if (err) {
          console.log("session destory error");
          console.log(err);
        }
      });

      return res
        .status(200)
        .send({ message: "인증이 정상적으로 완료되었습니다." });
    } else {
      return res.status(400).send({ message: "인증번호가 일치하지 않습니다." });
    }
  } catch (err) {
    return res.status(400).send();
  }
};

exports.saveCrnDocument = async (req, res) => {
  try {
    const { file } = req.files;
    const { account_id } = req;

    const path = `crn-document/${account_id}`;

    const flag = await S3.uploadFile(
      file.data,
      file.mimetype,
      `${path}/${file.name}`
    );

    if (flag) {
      await Account.update(
        {
          crn_document: `${path}/${file.name}`,
        },
        {
          where: { id: account_id },
        }
      );

      return res
        .status(200)
        .send({ documentUrl: `${S3Url}${path}/${file.name}` });
    } else {
      return res.status(400).send();
    }
  } catch (err) {
    return res.status(400).send();
  }
};

exports.approveDocument = async (req, res) => {
  try {
    const { account_id } = req.body;

    await Account.update(
      {
        level: "NORMAL",
      },
      {
        where: { id: account_id },
      }
    );

    await deleteUploadedFiles(account_id, "approve");

    return res.status(200).send();
  } catch (err) {
    return res.status(400).send();
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { account_id } = req.headers;

    await Account.update({
      crn_document: null
    }, {
      where: { id: account_id }
    });

    await deleteUploadedFiles(account_id, "delete");

    return res.status(200).send();
  }
  catch(err) {
    console.log(err);
    return res.status(400).send();
  }
};
