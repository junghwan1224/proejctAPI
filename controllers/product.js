"use strict";

const Product = require("../models").product;
const S3 = require("./common/s3");

exports.createByAdmin = async (req, res) => {
    try {
        const {
            name,
            unit,
            type,
            price_a,
            essential_stock,
        } = req.body;
        
        if(!name || !unit || !type || !essential_stock || price_a === 0) {
            return res.status(400).send({ message: "필수 정보를 기입해주세요." });
        }

        if(req.files) {
            // image upload to S3
        }

        await Product.create(req.body);

        return res.status(201).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.uploadImageByAdmin = async (req, res) => {
    try {
        const { file } = req.files;
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.readByAdmin = async (req, res) => {
    try {
        const { product_id } = req.query;

        const product = await Product.findOne({
            where: { id: product_id },
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            }
        });

        return res.status(200).send(product);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.updateByAdmin = async (req, res) => {
    try {
        const POSSIBLE_ATTRIBUTES = [
            "name",
            "unit",
            "specification",
            "type",
            "price_a",
            "price_b",
            "price_c",
            "price_d",
            "price_e",
            "essential_stock",
            "memo",
            "image"
        ];
        const newData = {};
        POSSIBLE_ATTRIBUTES.map(
            (attribute) => (newData[attribute] = req.body[attribute])
        );

        await Product.update(newData, {
            where: { id: req.body.product_id }
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
        const { product_id } = req.query;

        await Product.destroy({
            where: { id: product_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};