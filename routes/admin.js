module.exports = app => {
  const account = require("../controllers/account");
  const accountLevel = require("../controllers/accountLevel");
  const ADMIN_ROUTE = "/admin";
  app
    .route(ADMIN_ROUTE + "/account")
    .all((req, res, next) => {
      next();
    })
    .delete(account.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/account-level")
    .all((req, res, next) => {
      next();
    })
    .post(accountLevel.createByAdmin)
    .get(accountLevel.readByAdmin);

  app.route(ADMIN_ROUTE + "/product").all((req, res, next) => {
    next();
  });

  app.route(ADMIN_ROUTE + "/basket").all((req, res, next) => {
    next();
  });

  app.route(ADMIN_ROUTE + "/delivery").all((req, res, next) => {
    next();
  });
};
