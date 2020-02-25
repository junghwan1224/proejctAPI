"use strict";

const Basket = require("../models").basket;
const ProductAbstract = require("../models").product_abstract;
const Product = require("../models").product;

// By user

exports.readByUser = async (req, res) => {
    try {
        const { account_id } = req;

        const raw_items = await Basket.findAll({
            where: {
                account_id
            },
            attributes: ["quantity"],
            include: [
                {
                    model: Product,
                    required: true,
                    attributes: [
                        "price",
                        "brand",
                        "model",
                        "oe_number",
                        "start_year",
                        "end_year",
                        "id",
                        "category"
                    ],
                    include: [
                        {
                            model: ProductAbstract,
                            as: "product_abstract",
                            attributes: ["image", "maker", "maker_number", "stock", "type"]
                        }
                    ]
                }
            ]
        });

        // Fabricate:
        let basket_items = {};
        for (const raw_item of raw_items) {
            let item = {};
            item["quantity"] = raw_item.quantity;
            item["oe_number"] = raw_item.product.oe_number;
            item["brand"] = raw_item.product.brand;
            item["model"] = raw_item.product.model;
            item["start_year"] = raw_item.product.start_year;
            item["end_year"] = raw_item.product.end_year;
            item["engine"] = raw_item.product.engine;
            item["price"] = raw_item.product.price;
            item["image"] = raw_item.product.product_abstract.image;
            item["maker"] = raw_item.product.product_abstract.maker;
            item["maker_number"] = raw_item.product.product_abstract.maker_number;
            item["type"] = raw_item.product.product_abstract.type;
            item["category"] = raw_item.product.category;
            basket_items[raw_item.product.id] = item;
        }
        res.status(200).send(basket_items);
    }
    catch(err) {
        console.log(err);
        res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};

exports.createOrUpdateByUser = async (req, res) => {
    try {
        const { account_id } = req;
        const products = JSON.parse(req.body.products);

        for (const product of products) {
            const product_id = product.product_id;
            const quantity = product.quantity;

            const isProductExist = await Basket.count({
                where: {
                    account_id,
                    product_id
                }
            });
            if (quantity === 0) {
                // Delete if quantity is 0:
                await Basket.destroy({
                    where: {
                        account_id,
                        product_id
                    }
                });
            } else if (!isProductExist) {
                // Create producut
                await Basket.create({
                    account_id,
                    product_id,
                    quantity
                });
            } else {
                // Update if quantity is not zero and product exists
                const basket = await Basket.findOne({
                where: {
                        account_id,
                        product_id
                    }
                });
                
                await basket.update({
                    quantity
                });
            }
        }

        res.status(200).send();
    }
    catch(err) {
        console.log(err);
        res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};