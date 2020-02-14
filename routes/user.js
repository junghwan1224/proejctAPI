module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const login = require("../controllers/login");
  const product = require("../controllers/product");
  const productList = require("../controllers/productList");

  const order = require("../controllers/order");
  const payment = require("../controllers/payment");
  const receipt = require("../controllers/receipt");

  app
    .route("/account")
    .all(verifyToken.authUser)
    .get(account.readByUser)
    .put(account.updateByUser);

  app
    .route("/account")
    .post(account.createByUser)

  app
    .route("/login")
    .post(login.loginByUser);

  app
    .route("/product")
    .all(verifyToken.authUser)
    .get(product.readByUser);

  app
    .route("/product-list")
    .all(verifyToken.authUser)
    .get(productList.readByUser);

  app
    .route("/basket")
    .all(verifyToken.authUser);

  app
    .route("/delivery")
    .all(verifyToken.authUser);

  app
    .route("/favorite")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();

  app
    .route("/inquiry")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();
  
  app
    .route("/payment/webhook")
    .all(verifyToken.authUser)
    .post(payment.webHookByUser)

  app
    .route("/payment/cancel")
    .all(verifyToken.authUser)
    .post(payment.cancelByUser)

  app
    .route("/payment/issue-billing")
    .all(verifyToken.authUser)
    .post(payment.createBillingKeyByUser)
    .delete(payment.deleteBillingKeyByUser);
  
  app
    .route("/payment/billing")
    .all(verifyToken.authUser)
    .post(payment.billingByUser);

  app
    .route("/order")
    .all(verifyToken.authUser)
    .get(order.readByUser)
    .post(order.createByUser)
    .put(order.updateByUser)
  
  app
    .route("/receipt")
    .all(verifyToken.authUser)
    .get(receipt.readByUser)
    .post(receipt.createByUser)
};
