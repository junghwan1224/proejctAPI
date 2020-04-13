const Account = require("../../models").account;

const MILEAGE_PERCENTAGE = process.env.MILEAGE_PERCENTAGE;

/*
    마일리지 안쓰고 결제 -> 마일리지를 적립해줘야 함 -> 결제 취소함 -> 적립된 마일리지 차감

    마일리지 쓰고 결제 -> 마일리지 차감 및 적립은 x -> 결제 취소함 -> 차감된 마일리지 복구
*/

/*
    id: account id
    mileage: 유저가 갖고 있는 마일리지
    usedMileage: 계산할 때 사용된 마일리지
    purchaseFlag: 구매 / 취소 구분 boolean
    transaction: DB 트랜잭션
*/
const updateMileage = async (id, usedMileage, amount, purchaseFlag, transaction) => {
    const { mileage } = await Account.findOne({
        where: { id },
        attributes: ["mileage"]
    });

    if(purchaseFlag) {
        // 마일리지를 이용해서 결제했을 경우: 마일리지 차감
        if(usedMileage !== 0) {
            await Account.update({
                mileage: mileage-usedMileage
            }, {
                where: { id },
                transaction
            });
        }
        // 마일리지 사용하지 않고 결제했을 경우: 마일리지 적립
        else {
            await Account.update({
                mileage: mileage + Math.ceil(amount*MILEAGE_PERCENTAGE)
            }, {
                where: { id },
                transaction
            });
        }
    }
    else {
        // 구매 취소

        // 마일리지 사용해서 결제한거면 되돌려주고
        if(usedMileage !== 0) {
            await Account.update({
                mileage: mileage + usedMileage
            }, {
                where: { id },
                transaction
            });
        }
        // 적립시켜준거면 차감시켜주고
        else {
            await Account.update({
                mileage: mileage - Math.ceil(amount*MILEAGE_PERCENTAGE)
            }, {
                where: { id },
                transaction
            });
        }
    }
};

module.exports = updateMileage;