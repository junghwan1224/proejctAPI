module.exports = app => {
  const account = require("../controllers/account");

  app
    .route("/account")
    .all((req, res, next) => {
      next();
    })
    .get(account.readByUser)
    .post(account.createByUser)
    .put(account.updateByUser);
};
