import bcrypt from 'bcryptjs';
import { sign as JwtSign } from "jsonwebtoken";

import models from "../../models";

const JWT_STAFF_SECRET = process.env.JWT_STAFF_SECRET;

const loginByAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (email === undefined || email === null || email.length === 0) {
    return res.status(400).send({ message: "연락처를 입력해주세요." });
  }

  if (password === undefined || password === null || password.length === 0) {
    return res.status(400).send({ message: "비밀번호를 입력해주세요." });
  }

  try {
    const staff = await models.staff.findOne({
      where: {
        email,
      },
    });

    if (staff) {
      const { id, name, department } = staff.dataValues;
      if (bcrypt.compareSync(password, staff.dataValues.password)) {
        // create JWT and send data.
        let token = JwtSign({ id }, JWT_STAFF_SECRET, {
          expiresIn: "15 days",
        });

        res.cookie("staff", token);
        res.status(200).send({
          name,
          department,
          token,
        });
      } else {
        return res
          .status(400)
          .send({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }
    } else {
      res.status(400).send({
        message: "가입되지 않은 이메일 주소입니다.",
      });
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

export default loginByAdmin;
