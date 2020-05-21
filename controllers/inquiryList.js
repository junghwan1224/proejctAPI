"use strict";

const Inquiry = require("../models").inquiry;

exports.readByAdmin = async (req, res) => {
    try {
      const inquiryList = await Inquiry.findAll({
        attributes: { exclude: ["updatedAt"] },
      });
  
      return res.status(200).send(inquiryList);
    }
    catch(err) {
      console.log(err);
      return res.status(400).send();
    }
};