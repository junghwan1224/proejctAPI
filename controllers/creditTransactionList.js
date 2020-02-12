const sequelize = require("sequelize");
const { Op } = sequelize;
const Order = require("../models").order;

// (get) /ark/all: 모든 거래 리스트 조회
exports.readByAdmin = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                [Op.not]: { status: "not paid" }
            },
            group: ["account_id", "merchant_uid", "name", "pay_method", "status", "createdAt", "updatedAt"],
            order: [["createdAt", "DESC"]],
            attributes: [
                "account_id", 
                "name", 
                "merchant_uid", 
                "pay_method", 
                "status", 
                "createdAt", 
                "updatedAt", 
                [sequelize.fn('sum', sequelize.col('quantity')), 'quantity'],
                [sequelize.fn('sum', sequelize.col('amount')), 'amount']
            ],
        });

        res.status(200).send({ orders });
    }
    catch(err) {
        console.log(err);
        res.status(400).send({ message: "에러가 발생했습니다. 페이지를 새로고침 해주세요." });
    }
};