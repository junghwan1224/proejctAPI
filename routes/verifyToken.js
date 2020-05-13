const jwt = require("jsonwebtoken");
const Account = require("../models").account;
const Admin = require("../models").admin;

const DEV_SECRET = process.env.DEV_SECRET;

/**
 * Validate view access by verifying given token.
 */

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization;

//   const verify = jwt.verify(token, DEV_SECRET, (err, decoded) => {
//     if (err) {
//       console.log("jwt verify error");
//       return null;
//     }

//     return decoded.id;
//   });

//   if (verify) {
//     req.account_id = verify;
//     next();
//   } else {
//     return res.status(403).send({
//       status: "jwt verify failed",
//       message: "유효한 유저의 정보가 아닙니다. 다시 로그인해주세요."
//     });
//   }
// };

const verifyToken = async (token, type) => {
  // if user
  if (type === "user") {
    const accountId = jwt.verify(token, DEV_SECRET, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded.id;
    });

    if (accountId) {
      const account = await Account.findOne({
        where: { id: accountId }
      });

      if (account) {
        return accountId;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  // if admin
  else {
    const adminId = jwt.verify(token, DEV_SECRET, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded.id;
    });

    if (adminId) {
      // find in admin
      const admin = await Admin.findOne({
        where: { id: adminId }
      });

      if (admin) {
        return adminId;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
};

// authenticate user
const authUser = async (req, res, next) => {
  const { authorization } = req.headers;
  const id = await verifyToken(authorization, "user");

  if (id) {
    req.account_id = id;
    next();
  } else {
    return res.status(403).send();
  }
};

// authenticate admin
const authAdmin = async (req, res, next) => {
  const { authorization } = req.headers;
  const id = await verifyToken(authorization, "admin");

  if (id) {
    req.admin_id = id;
    next();
  } else {
    return res.status(403).send();
  }
};

module.exports = { authUser, authAdmin, verifyToken };