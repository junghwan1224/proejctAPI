const jwt = require("jsonwebtoken");
const DEV_SECRET = process.env.DEV_SECRET;

function verifyJWT(req, res) {
    const token = req.headers.authorization;

    const verify = jwt.verify(token, DEV_SECRET, (err, decoded) => {
        if(err) {
            console.log("jwt verify error");
            console.log(err);
            // return res.status(403).send({
            //     status: "jwt verify failed",
            //     message: "유효한 유저의 정보가 아닙니다. 다시 로그인해주세요."
            // });
            return null;
        }

        return decoded.id;
    });

    return verify;
}

module.exports = verifyJWT;