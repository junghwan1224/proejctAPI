var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

const DEV_SECRET = process.env.DEV_SECRET;

/**
 * Validate view access by verifying given token.
 */

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  const verify = jwt.verify(token, DEV_SECRET, (err, decoded) => {
      if(err) {
          console.log("jwt verify error");
          return null;
      }

      return decoded.id;
  });

  if(verify) {
    req.account_id = verify;
    next();
  }
  else {
    return res.status(403).send({
        status: "jwt verify failed",
        message: "유효한 유저의 정보가 아닙니다. 다시 로그인해주세요."
    });
  }
}

module.exports = verifyToken;
