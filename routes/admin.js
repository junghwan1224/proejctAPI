module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const accountLevel = require("../controllers/accountLevel");

  const admin = require("../controllers/admin");
  const productAbstract = require("../controllers/productAbstract");
  const productAbstractList = require("../controllers/productAbstractList");
  const product = require("../controllers/product");

  const ADMIN_ROUTE = "/admin";
  app
    .route(ADMIN_ROUTE + "/account")
    .all(verifyToken.authAdmin)
    .delete(account.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/admin")
    .all((req, res, next) => {
      next();
    })
    .post(admin.createByAdmin)
    .get(admin.readByAdmin)
    .put(admin.updateByAdmin)
    .delete(admin.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/account-level")
    .all(verifyToken.authAdmin)
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

  app
    .route(ADMIN_ROUTE + "/product")
    .all((req, res, next) => {
      next();
    })
    .post(product.createByAdmin)
    .put(product.updateByAdmin)
    .delete(product.deleteByAdmin);

  app.route(ADMIN_ROUTE + "/basket").all((req, res, next) => {
    next();
  });

  app.route(ADMIN_ROUTE + "/delivery").all((req, res, next) => {
    next();
  });

  app
    .route(`${ADMIN_ROUTE}/article`)
    .all(verifyToken.authAdmin)
    .get()
    .post()
    .put()
    .delete();

  app
    .route(`${ADMIN_ROUTE}/credit-transaction`)
    .all(verifyToken.authAdmin)
    .get()
    .post()
    .put()
    .delete();
  
  app
    .route(`${ADMIN_ROUTE}/credit-transaction/list`)
    .all(verifyToken.authAdmin)
    .get()
    .post()
    .put()
    .delete();
};
