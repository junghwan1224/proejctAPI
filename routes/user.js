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

  app.route("/product").all((req, res, next) => {
    next();
  });

  app.route("/basket").all((req, res, next) => {
    next();
  });

  app.route("/delivery").all((req, res, next) => {
    next();
  });
};
