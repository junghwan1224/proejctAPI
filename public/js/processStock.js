const sequelize = require("sequelize");
const { Op } = sequelize;
const Product = require("../../models").product;
const ProductAbstract = require("../../models").product_abstract;

// productId, quantity: Array
// purchaseFlag: Boolean => true: - / false: +
const processStockFunc = async (productId, quantity, purchaseFlag, transaction) => {
    // product_id 와 수량 묶어줌
    const prodArr = productId.map((p, idx) => ({
        "id": p,
        "quantity": quantity[idx]
    }));
    // id 오름차순으로 정렬
    prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });

    // abstract id 값 조회
    const abstractsIds = await Product.findAll({
        where: { id: { [Op.in]: prodArr.map(e => e.id) } },
        include: [
            {
                model: ProductAbstract,
                required: true,
                as: "product_abstract",
            }
        ],
        transaction
    });

    const abstArr = abstractsIds.map(
        product => {
            const { dataValues } = product;
            const { product_abstract } = dataValues;
            const prop = product_abstract.dataValues;

            return prop.id;
        });
    
    // abstract id 와 수량 묶어줌
    const abstObj = abstArr.map((abst, idx) => ({
        "id": abst,
        "quantity": prodArr[idx].quantity
    }));

    // 같은 id 값들인 경우 수량 합쳐줌
    const abstractMap = abstObj.reduce((prev, cur) => {
        let count = prev.get(cur.id) || 0;
        prev.set(cur.id, cur.quantity + count);
        return prev;
    }, new Map());

    // 배열로 만든 후 정렬
    const mapToArr = [...abstractMap].map( ([id, quantity]) => { return {id, quantity} });
    mapToArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });

    // 수량 업데이트
    const abstracts = await ProductAbstract.findAll({
        where: {
            id: { [Op.in]: abstObj.map(e => e.id) }
        },
        transaction
    });
    const updatedProducts = abstracts.map(
        product => {
            return product.dataValues;
        }
    );

    // 상품을 구매하는 경우, 재고에서 차감
    if(purchaseFlag) {
        updatedProducts.forEach(
            (product, idx) => {
                product.stock -= mapToArr[idx].quantity;
            }
        );
    }

    // 환불(취소)하는 경우,재고 더해줌
    else {
        updatedProducts.forEach(
            (product, idx) => {
                product.stock += mapToArr[idx].quantity;
            }
        );
    }

    return updatedProducts;
};

module.exports = processStockFunc;