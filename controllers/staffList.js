"use strict";

const Staff = require("../models").staff;

exports.readByAdmin = async (req, res) => {
  try {
    const response = await Staff.findAll({
      attributes: {
        exclude: ["password"],
      },
    });
    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};
