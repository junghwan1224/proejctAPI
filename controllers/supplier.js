"use strict";

const Supplier = require("../models").supplier;
const Staff = require("../models").staff;

exports.createByAdmin = async (req, res) => {
  /* If phone, password, name are not included, return 400: */
  if (!req.body.name) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요.",
    });
  }

  /* If the email is already registered, raise 400: */
  try {
    const response = await Supplier.findOne({
      where: { name: req.body.name },
    });
    if (response) {
      return res.status(400).send({ message: "이미 등록된 거래처입니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }

  /* Create account, with level set to "UNCONFIRMED" : */
  try {
    await Supplier.create({
      address: req.body.address,
      name: req.body.name,
      crn: req.body.crn,
      poc: req.body.poc,
      fax: req.body.fax,
      alias: req.body.alias,
      worker: req.body.worker,
      worker_poc: req.body.worker_poc,
      staff_id: req.body.staff_id,
      memo: req.body.memo,
    });
    return res.status(201).send();
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.readByAdmin = async (req, res) => {
  try {
    const response = await Supplier.findOne({
      where: {
        id: req.query.supplier_id,
      },
      attributes: {
        exclude: ["staff_id"],
      },
      include: [
        {
          model: Staff,
          required: false,
          attributes: ["id", "name", "department", "rank"],
        },
      ],
    });
    if (response) {
      return res.status(200).send(response);
    } else {
      return res
        .status(400)
        .send({ message: "해당 거래처를 찾을 수 없습니다." });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.updateByAdmin = async (req, res) => {
  /* Allow pre-defined attributes only:  */
  const POSSIBLE_ATTRIBUTES = [
    "address",
    "name",
    "crn",
    "poc",
    "fax",
    "alias",
    "worker",
    "worker_poc",
    "staff_id",
    "memo",
  ];

  let newData = {};
  POSSIBLE_ATTRIBUTES.map(
    (attribute) => (newData[attribute] = req.body[attribute])
  );

  if (!req.body.supplier_id)
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });

  /* Verify whether the supplier exists: */
  try {
    const response = await Supplier.findOne({
      where: {
        id: req.body.supplier_id,
      },
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "해당 ID에 대한 거래처 데이터가 존재하지 않습니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }

  /* Return attributes based on the user request(parameters): */
  try {
    await Supplier.update(newData, {
      where: {
        id: req.body.supplier_id,
      },
      individualHooks: true,
    });
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.deleteByAdmin = async (req, res) => {
  /* Send 400 if account_id is not given: */
  try {
    const { supplier_id } = req.query;

    if (!supplier_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요.",
      });
    }
    /* Verify whether the user exists: */
    const response = await Supplier.findOne({
      where: { id: supplier_id },
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "해당 유저를 발견하지 못했습니다." });
    }

    /* Delete account data from the DB: */
    await Supplier.destroy({
      where: { id: supplier_id },
      limit: 1,
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
