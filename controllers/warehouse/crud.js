"use strict";

const WareHouse = require("../../models").warehouse;

exports.createByAdmin = async (req, res) => {
    try {
        const { name, location, memo } = req.body;

        if(!name || !location)
            return res.status(400).send({ message: "필수 정보를 기입해주세요." });

        const data = { name, location };
        if(memo) data.memo = memo;

        await WareHouse.create(data);

        return res.status(201).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.readByAdmin = async (req, res) => {
    try {
        const { warehouse_id } = req.query;

        const warehouseInfo = await WareHouse.findOne({
            where: { id: warehouse_id },
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            }
        });

        return res.status(200).send(warehouseInfo);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.updateByAdmin = async (req, res) => {
    try {
        const POSSIBLE_ATTRIBUTES = ["name", "location", "memo"];
        const newData = {};
        POSSIBLE_ATTRIBUTES.map(
            (attribute) => (newData[attribute] = req.body[attribute])
        );

        const { warehouse_id } = req.body;

        await WareHouse.update(newData, {
            where: { id: warehouse_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.deleteByAdmin = async (req, res) => {
    try {
        const { warehouse_id } = req.query;
        
        await WareHouse.destroy({
            where: { id: warehouse_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};
