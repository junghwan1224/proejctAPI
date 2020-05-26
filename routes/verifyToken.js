const jwt = require("jsonwebtoken");
const Account = require("../models").account;
const Staff = require("../models").staff;

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_STAFF_SECRET = process.env.JWT_STAFF_SECRET;
/**
 * Validate view access by verifying given token.
 */

const verifyToken = async (token, type) => {
  // if user
  if (type === "user") {
    const accountID = jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded.id;
    });

    if (accountID) {
      const account = await Account.findOne({
        where: { id: accountID },
      });

      if (account) {
        return accountID;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  // if admin - validate ark access:
  else {
    const staff_id = jwt.verify(token, JWT_STAFF_SECRET, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded.id;
    });

    if (staff_id) {
      // find in admin
      const response = await Staff.findOne({
        where: { id: staff_id },
      });
      if (response) {
        return {
          id: response.dataValues.id,
          permission: response.dataValues.permission,
        };
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
  const data = await verifyToken(authorization, "admin");
  if (data) {
    req.staff_id = data.id;
    req.staff_permission = data.permission;
    next();
  } else {
    return res.status(403).send();
  }
};

module.exports = { authUser, authAdmin, verifyToken };
