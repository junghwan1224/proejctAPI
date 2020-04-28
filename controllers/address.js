"use strict";

const Address = require("../models").address;
const models = require("../models");

exports.readByUser = async (req, res) => {
    try {
      const { account_id } = req;

      const address = await Address.findAll({
        where: { account_id },
      });

      if (!address.length) {
        return res.status(200).send({ message: "success", address: null });
      } else {
        return res.status(200).send({ message: "success", address: address[0].dataValues });
      }
    } catch (err) {
      res
        .status(400)
        .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};

exports.createByUser = async (req, res) => {
    try {
        const { account_id } = req;
        const { addr_postcode, addr_primary, addr_detail } = req.body;

        const transaction = await models.sequelize.transaction();

        const address = await Address.findOne({
            where: { account_id },
            transaction
        });

        if (address) {
        const { postcode, primary, detail } = address.dataValues;

        const obj = {
            postcode: addr_postcode,
            primary: addr_primary,
            detail: addr_detail
        };

        const addr = {
            postcode,
            primary,
            detail
        };

        if (!Object.is(JSON.stringify(obj), JSON.stringify(addr))) {
            await Address.update(
            {
                postcode: addr_postcode,
                primary: addr_primary,
                detail: addr_detail
            },
            {
                where: { id: address.dataValues.id },
                transaction
            }
            );

            await transaction.commit();

            return res.status(200).send({ message: "update success" });
        }
        } else {
        await Address.create(
            {
                account_id,
                postcode: addr_postcode,
                primary: addr_primary,
                detail: addr_detail
            },
            {
            transaction
            }
        );

        await transaction.commit();

        return res.status(200).send({ message: "create success" });
        }

        res.send({ message: "success" });
    } catch (err) {
        res
        .status(400)
        .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};

exports.readByAdmin = async (req, res) => {};

exports.createByAdmin = async (req, res) => {};