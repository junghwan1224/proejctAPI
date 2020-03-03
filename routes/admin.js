module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const accountList = require("../controllers/accountList");
  const login = require("../controllers/login");
  const accountLevel = require("../controllers/accountLevel");

  const admin = require("../controllers/admin");
  const productAbstract = require("../controllers/productAbstract");
  const productAbstractList = require("../controllers/productAbstractList");
  const product = require("../controllers/product");
  const productList = require("../controllers/productList");

  const delivery = require("../controllers/delivery");
  const deliveryList = require("../controllers/deliveryList");
  const deliveryPerUser = require("../controllers/deliveryPerUser");

  const payment = require("../controllers/payment");
  const creditTransaction = require("../controllers/creditTransaction");
  const creditTransactionList = require("../controllers/creditTransactionList");
  const receiptExternal = require("../controllers/receiptExternal");

  const roster = require("../controllers/roster");

  const ADMIN_ROUTE = "/admin";
  app
    .route(ADMIN_ROUTE + "/account")
    .all(verifyToken.authAdmin)
    .delete(account.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/account-list")
    .all(verifyToken.authAdmin)
    .get(accountList.readByAdmin);

  app.route(ADMIN_ROUTE + "/login").post(login.loginByAdmin);

  app
    .route(ADMIN_ROUTE + "/admin")
    .all(verifyToken.authAdmin)
    .get(admin.readByAdmin)
    .post(admin.createByAdmin)
    .put(admin.updateByAdmin)
    .delete(admin.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/account-level")
    .all(verifyToken.authAdmin)
    .post(accountLevel.createByAdmin)
    .get(accountLevel.readByUser);

  app
    .route(ADMIN_ROUTE + "/product-abstract")
    .all(verifyToken.authAdmin)
    .post(productAbstract.createByAdmin)
    .get(productAbstract.readByAdmin)
    .put(productAbstract.updateByAdmin)
    .delete(productAbstract.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/product-abstract-list")
    .all(verifyToken.authAdmin)
    .get(productAbstractList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/product-list")
    .all(verifyToken.authAdmin)
    .get(productList.readByAdmin);

  app
    .route(`${ADMIN_ROUTE}/product`)
    .all(verifyToken.authAdmin)
    .post(product.createByAdmin)
    .get(product.readByAdmin)
    .put(product.updateByAdmin)
    .delete(product.deleteByAdmin);

  app.route(ADMIN_ROUTE + "/basket").all(verifyToken.authAdmin);

  app
    .route(ADMIN_ROUTE + "/delivery")
    .all(verifyToken.authAdmin)
    .get(delivery.readByAdmin)
    .put(delivery.updateByAdmin);

  app
    .route(ADMIN_ROUTE + "/delivery-list")
    .all(verifyToken.authAdmin)
    .get(deliveryList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/delivery-per-user")
    .all(verifyToken.authAdmin)
    .get(deliveryPerUser.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/article")
    .all(verifyToken.authAdmin)
    .get()
    .post()
    .put()
    .delete();

  app
    .route(ADMIN_ROUTE + "/payment/refund")
    .all(verifyToken.authAdmin)
    .post(payment.refundByAdmin);

  app
    .route(ADMIN_ROUTE + "/credit-transaction")
    .all(verifyToken.authAdmin)
    .get(creditTransaction.readByAdmin)
    .post(creditTransaction.createByAdmin)
    .put(creditTransaction.updateByAdmin)
    .delete(creditTransaction.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/credit-transaction/list")
    .all(verifyToken.authAdmin)
    .get(creditTransactionList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/receipt-external")
    .all(verifyToken.authAdmin)
    .get(receiptExternal.readByAdmin)
    .post(receiptExternal.createByAdmin);

  app
    .route(ADMIN_ROUTE + "/roster")
    // .all(verifyToken.authAdmin)
    .get(roster.readByAdmin)
    .post(roster.createByAdmin);
};
