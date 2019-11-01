const jwt = require("jsonwebtoken");
const DEV_SECRET = process.env.DEV_SECRET;

function verifyJWT(req, res) {
    const token = req.headers.authorization;
    jwt.verify(token, DEV_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).send({
                status: "jwt verify failed",
                message: "유효한 유저의 정보가 아닙니다. 다시 로그인해주세요."
            });
        }

        return decoded.id;
    });
}

module.exports = verifyJWT;