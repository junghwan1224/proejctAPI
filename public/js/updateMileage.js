const Account = require("../../models").account;

const updateMileage = async (id, mileage, transaction) => {
    await Account.update({
        mileage
    }, {
        where: { id },
        transaction
    });
};

module.exports = updateMileage;