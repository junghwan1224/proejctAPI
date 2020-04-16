const makeSignature = require("./signature");
const axios = require("axios");

const SENS_API_V2_URL = process.env.SENS_API_V2_URL + process.env.SENS_API_V2_URI;
const SENS_ACCESS_KEY = process.env.SENS_ACCESS_KEY;
const SENS_SENDER = process.env.SENS_SENDER;

const sendSMS = async (text, to, timestamp) => {
    await axios({
        url: SENS_API_V2_URL,
        method: "post",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-ncp-apigw-timestamp": timestamp,
            "x-ncp-iam-access-key": SENS_ACCESS_KEY,
            "x-ncp-apigw-signature-v2": makeSignature(timestamp)
        },
        data: {
            type: "SMS",
            from: SENS_SENDER,
            content: text,
            messages: [{
                to
            }]
        }
    });
};

module.exports = sendSMS;