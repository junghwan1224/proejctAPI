"use strict";

const sendSMS = require("../public/js/sendSMS");

// 인증번호 발급
exports.issueNumber = async (req, res) => {
    try {
        const { phone } = req.body;

        // 6자리 인증번호 생성
        const certifyNumber = Math.floor(Math.random() * 899999 + 100000);

        // 인증번호 세션에 저장
        const sess = req.session;
        sess.certifyNumber = certifyNumber;

        req.session.save(err => {
            if(err) {
                console.log("session error");
                console.log(err);
            }
        });

        // SMS 전송
        const timestamp = new Date().getTime().toString();
        const text = `MONTAR 인증번호 [${certifyNumber}]를 입력해주세요.`;

        await sendSMS(text, phone, timestamp);

        return res.status(200).send({ message: "인증번호가 발송되었습니다." });
    }
    catch(err) {
        return res.status(400).send();
    }
};

// 인증
exports.check = async (req, res) => {
    try {
        const { certifyNumber } = req.body;

        if(parseInt(certifyNumber) === req.session.certifyNumber) {
            req.session.destroy(err => {
                if(err) {
                    console.log("session destory error");
                    console.log(err);
                }
            });

            return res.status(200).send({ message: "인증이 정상적으로 완료되었습니다." });
        }

        else {
            return res.status(400).send({ message: "인증번호가 일치하지 않습니다." });
        }
    }
    catch(err) {
        return res.status(400).send();
    }
};