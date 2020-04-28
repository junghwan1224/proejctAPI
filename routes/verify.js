const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const DEV_SECRET = process.env.DEV_SECRET;

const verifyToken = (req, res, next) => {
    if (!req.body.accessToken) {
      return res.status(403).send({ auth: false, message: "No token provided." });
    }
    jwt.verify(req.body.accessToken, DEV_SECRET, function(err, decoded) {
      if (err) {
        return res.status(403).send({ auth: false, message: err });
      }
      if (!next) {
        res.status(200);
      } else next();
    });
  };

router.post("/", function(req, res, next) {
    return verifyToken(req, res);
  });

module.exports = router;