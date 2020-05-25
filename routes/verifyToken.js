const jwt = require("jsonwebtoken");
const Account = require("../models").account;
const Admin = require("../models").admin;

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;

/**
 * Validate view access by verifying given token.
 */

const verifyToken = async (token, type) => {
  // if user
  if (type === "user") {
    const accountId = jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded.id;
    });

    if (accountId) {
      const account = await Account.findOne({
        where: { id: accountId },
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

  // if admin - validate ark access:
  else {
    const adminId = jwt.verify(token, JWT_ADMIN_SECRET, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded.id;
    });

    if (adminId) {
      // find in admin
      const admin = await Admin.findOne({
        where: { id: adminId },
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
