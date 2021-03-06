import { verify as JwtVerify } from "jsonwebtoken";
import models from "../models";

const JWT_STAFF_SECRET = process.env.JWT_STAFF_SECRET;
/**
 * Validate view access by verifying given token.
 */

const verifyToken = async (token, type) => {
  const staff_id = JwtVerify(token, JWT_STAFF_SECRET, (err, decoded) => {
    if (err) {
      return null;
    }
    return decoded.id;
  });

  if (staff_id) {
    const response = await models.staff.findOne({
      where: { id: staff_id },
    });
    const { id, permission } = response.dataValues;
    if (response) {
      return {
        id,
        permission,
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// authenticate admin
export const authStaff = async (req, res, next) => {
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
