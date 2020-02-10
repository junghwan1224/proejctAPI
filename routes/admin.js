module.exports = app => {
  const account = require("../controllers/account");
  const accountLevel = require("../controllers/accountLevel");
  const productAbstract = require("../controllers/productAbstract");
  const productAbstractList = require("../controllers/productAbstractList");

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

  app
    .route(ADMIN_ROUTE + "/product-abstract")
    .all((req, res, next) => {
      next();
    })
    .post(productAbstract.createByAdmin)
    .get(productAbstract.readByAdmin)
    .put(productAbstract.updateByAdmin)
    .delete(productAbstract.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/product-abstract-list")
    .all((req, res, next) => {
      next();
    })
    .get(productAbstractList.readByAdmin);

  app.route(ADMIN_ROUTE + "/basket").all((req, res, next) => {
    next();
  });

  app.route(ADMIN_ROUTE + "/delivery").all((req, res, next) => {
    next();
  });
};
