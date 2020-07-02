"use strict";

const WareHouse = require("../models").warehouse;

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
    try {}
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.updateByAdmin = async (req, res) => {
    try {}
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.deleteByAdmin = async (req, res) => {
    try {}
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};
