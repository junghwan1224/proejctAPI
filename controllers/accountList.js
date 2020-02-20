"use strict";

const Account = require("../models").account;

exports.readByAdmin = async (req, res) => {
    try {
        const accountList = await Account.findAll();

        res.status(200).send(accountList)
    }
    catch(err) {
        return res.status(400).send();
    }
};