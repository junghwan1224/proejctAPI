"use strict"

const DomesticPurchase = require("../models").domestic_purchase;

exports.readByAdmin = async (req, res) => {
    try {
        const response = await DomesticPurchase.findAll();

        return res.status(200).send(response);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};