const sequelize = require("sequelize");
const { Op } = sequelize;
const Product = require("../../models").product;

// productId, quantity: Array
// purchaseFlag: Boolean => true: - / false: +
// transaction: sequelize transaction
const processStock = async (productId, quantity, purchaseFlag, transaction) => {
    // product_id 와 수량 묶어줌
    const prodArr = productId.map((p, idx) => ({
        "id": p,
        "quantity": quantity[idx]
    }));
    // id 오름차순으로 정렬
    prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });

    // DB에서 상품 조회
    const products = await Product.findAll({
        where: { id: { [Op.in]: prodArr.map(p => p.id) } },
        transaction
    }).map(p => p.dataValues);

    if(purchaseFlag) {
        products.forEach(
            (product, idx) => {
                product.stock -= prodArr[idx].quantity
            }
        );
    }
    else {
        products.forEach(
            (product, idx) => {
                product.stock += prodArr[idx].quantity
            }
        );
    }

    return products;
};

module.exports = processStock;