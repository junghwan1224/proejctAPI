const models = require("../models");
const Account = require("../models").account;
const Order = require("../models").order;
const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;

const processStock = require("../public/js/processStock");

// (get) /ark/detail: 특정 거래 상세정보 조회
exports.readByAdmin = async (req, res) => {
    try{
        const { merchant_uid } = req.query;

        const order = await Order.findAll({
            where: { merchant_uid },
            include: [{
                model: Product,
                required: true,
                include: [{
                    model: ProductAbstract,
                    required: true,
                    as: "product_abstract",
                    attributes: ["image", "maker", "maker_number", "type"]
                }]
            },
            {
                model: Account,
                required: true,
                attributes: ["phone", "name", "crn", "mileage", "email"],
            }],
        });

        res.status(200).send({ order });
    }
    catch(err) {
        console.log(err);
        res.status(400).send({ message: "에러가 발생했습니다. 페이지를 새로고침 해주세요." });
    }
};

// 외상거래 생성
exports.createByAdmin = async (req, res) => {
    try {
        const { 
            account_id,
            merchant_uid,
            products,
            pay_method,
            name,
            amount, // array
            quantity,  // array
            address_id,
            addrArray, // buyer_addr
            buyer_postcode,
            memo
         } = req.body;
    
        const transaction = await models.sequelize.transaction();
    
        // check stock of product
        const productsIdArr = products.split(",");
        const productsQuantityArr = quantity.split(",").map(q => parseInt(q));
        const productsAmountArr = amount.split(",").map(a => parseInt(a));
    
        const processedProducts = await processStock(productsIdArr, productsQuantityArr, true, transaction);
        
        // 요청한 수량보다 재고가 적은 abstract의 id를 배열에 저장
        const scarceProductsArr = processedProducts.reduce(
            (acc, product, idx) => {
                if(product.stock < 0) {
                    acc.push(idx);
                    return acc;
                }
                else {
                    return acc;
                }
            },
            []
        );
    
        // 재고가 부족한 제품이 있는 경우
        if(scarceProductsArr.length > 0) {
    
            // abstract_id 값으로 상품 조회
            const scarceProducts = await Product.findAll({
                where: {
                    abstract_id: { [Op.in]: scarceProductsArr }
                },
                transaction
            });
    
            await transaction.commit();
    
            return res.status(400).send({ api: "saveOrder", message: "재고 부족", scarceProducts });
        }
    
        await ProductAbstract.bulkCreate(products, { 
            updateOnDuplicate: ["stock"],
            transaction
        });
    
        //  update to account address value
        const parsedAddr = addrArray.split("&");
        // 입력된 주소가 없을 경우
        if(! parseInt(address_id)) {
            await Address.create({
                account_id,
                primary: parsedAddr[0],
                detail: parsedAddr[1],
                postcode: buyer_postcode
            }, {
                transaction
            });
        }
        // 입력된 주소가 있는 경우
        else {
            const addr = await Address.findOne({
                where: {
                    id: address_id,
                    account_id
                },
                attributes: ["postcode", "primary", "detail"],
                transaction
            });
       
            const optionInfoObj = {
                postcode: buyer_postcode,
                primary: parsedAddr[0],
                detail: parsedAddr[1],
            };
    
            // 입력된 주소가 있으나 수정한 경우
            if(! Object.is(JSON.stringify(addr.dataValues), JSON.stringify(optionInfoObj))) {
                await Address.update({
                    postcode: buyer_postcode,
                    primary: parsedAddr[0],
                    detail: parsedAddr[1],
                },
                {
                    where: { id: address_id, account_id },
                    transaction
                });
            }
        }
    
        // insert to DB
        const newOrderArray = productsIdArr.map(
            (product, idx) => {
                return {
                    merchant_uid,
                    account_id,
                    product_id: product,
                    name,
                    amount: (productsAmountArr[idx] * productsQuantityArr[idx]),
                    quantity: productsQuantityArr[idx],
                    pay_method,
                    status: "credit not paid",
                    memo
                };
            }
        );
        await Order.bulkCreate(newOrderArray, {
            shipping_postcode: buyer_postcode,
            shipping_primary: parsedAddr[0],
            shipping_detail: parsedAddr[1],
            transaction
        });
    
        await transaction.commit();
    
        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};

// 외상거래 상태 변경
exports.updateByAdmin = async (req, res) => {
    try {
        const { merchant_uid, type } = req.body;
        // type: 1 => 외상거래 완료
        // type: 0 => 외상거래 취소

        if(type) {
            await Order.update({
                status: "credit"
            }, {
                where: {
                    merchant_uid
                }
            });
    
            return res.status(200).send({ message: "결제처리가 완료되었습니다." });
        }
        else {
            const transaction = await models.sequelize.transaction();

            // stock update
            const orders = await Order.findAll({
                where: { merchant_uid },
                transaction
            });
            const productsId = orders.map(o => o.dataValues.product_id);
            const productsQuantity = orders.map(o => o.dataValues.quantity);

            const products = await processStock(productsId, productsQuantity, false, transaction);

            await ProductAbstract.bulkCreate(products, { 
                updateOnDuplicate: ["stock"],
                transaction
            });

            await Order.update({
                status: "cancelled"
            }, {
                where: { merchant_uid },
                transaction
            });

            await transaction.commit();

            return res.status(200).send({ message: "결제 취소가 완료되었습니다." });
        }
    }
    catch(err) {
        console.log(err);
        res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};

// (delete) /ark/credit: 특정 거래 삭제
exports.deleteByAdmin = async (req, res) => {
    try {
        const { merchant_uid } = req.body;

        await Order.destroy({
            where: { merchant_uid }
        });

        res.status(200).send();
    }
    catch(err) {
        console.log(err);
        res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};