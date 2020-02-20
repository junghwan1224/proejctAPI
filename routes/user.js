module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const address = require("../controllers/address");
  const login = require("../controllers/login");
  const certify = require("../controllers/certify");

  const product = require("../controllers/product");
  const productList = require("../controllers/productList");

  const delivery = require("../controllers/delivery");
  const deliveryList = require("../controllers/deliveryList");

  const order = require("../controllers/order");
  const payment = require("../controllers/payment");
  const receipt = require("../controllers/receipt");

  app
    .route("/account-create")
    .post(account.createByUser)
  
  app
    .route("/account")
    .all(verifyToken.authUser)
    .get(account.readByUser)
    .put(account.updateByUser);

  app
    .route("/login")
    .post(login.loginByUser);
  
  app
    .route("/address")
    .all(verifyToken.authUser)
    .get(address.readByUser)
    .post(address.createByUser);

  app
    .route("/certify/issue-number")
    .post(certify.issueNumber);
  
  app
    .route("/certify/check")
    .post(certify.check);

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
    .all(verifyToken.authUser)
    .get(delivery.readByUser);

  app
    .route("/delivery-list")
    .all(verifyToken.authUser)
    .get(deliveryList.readByUser);

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
