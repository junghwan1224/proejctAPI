const axios = require("axios");

const REST_API_KEY = process.env.IMPORT_REST_API_KEY;
const REST_API_SECRET = process.env.IMPORT_REST_API_SECRET;

const getToken = async () => {
    // 아임포트 인증 토큰 발급
    const getToken = await axios({
        url: "https://api.iamport.kr/users/getToken",
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: {
          imp_key: REST_API_KEY,
          imp_secret: REST_API_SECRET
        }
    });

    // 인증 토큰
    const { access_token } = getToken.data.response;

    return access_token;
};

module.exports = getToken;