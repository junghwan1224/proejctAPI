module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const address = require("../controllers/address");
  const login = require("../controllers/login");
  const certify = require("../controllers/certify");

  const product = require("../controllers/product");
  const productList = require("../controllers/productList");

  const basket = require("../controllers/basket");

  const delivery = require("../controllers/delivery");
  const deliveryList = require("../controllers/deliveryList");
  const invoice = require("../controllers/invoice");

  const order = require("../controllers/order");
  const payment = require("../controllers/payment");
  const receipt = require("../controllers/receipt");
  const cardInfo = require("../controllers/cardInfo");

  const inquiry = require("../controllers/inquiry");

  // Non User Controller
  const orderNonUser = require("../controllers/orderNonUser");

  app.route("/account-create").post(account.createByUser);

  app
    .route("/account")
    .all(verifyToken.authUser)
    .get(account.readByUser)
    .put(account.updateByUser);

  app
    .route("/account/reset-pwd")
    .put(account.updateByNonUser);

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
    .route("/certify/document")
    .all(verifyToken.authUser)
    .post(certify.saveCrnDocument);

  app
    .route("/product")
    // .all(verifyToken.authUser)
    .get(product.readByUser);

  app
    .route("/product-list")
    // .all(verifyToken.authUser)
    .get(productList.readByUser);

  app
    .route("/basket")
    .all(verifyToken.authUser)
    .get(basket.readByUser)
    .post(basket.createOrUpdateByUser)
    .delete(basket.deleteByUser);

  app
    .route("/delivery")
    .all(verifyToken.authUser)
    .get(delivery.readByUser);

  app
    .route("/delivery-list")
    .all(verifyToken.authUser)
    .get(deliveryList.readByUser);

  app
    .route("/invoice")
    .get(invoice.readByUser);

  app
    .route("/favorite")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();

  app
    .route("/inquiry")
    .post(inquiry.createByUser);

  app
    .route("/payment/webhook")
    .post(payment.webHookByUser);

  app
    .route("/payment/cancel")
    .post(payment.cancelByUser);

  app
    .route("/payment/issue-billing")
    .post(payment.createBillingKeyByUser)
    .delete(payment.deleteBillingKeyByUser);

  app
    .route("/payment/billing")
    .post(payment.billingByUser);

  app
    .route("/order")
    .all(verifyToken.authUser)
    .get(order.readByUser)
    .post(order.createByUser)
    .put(order.updateByUser);

  app
    .route("/receipt")
    .all(verifyToken.authUser)
    .get(receipt.readByUser)
    .post(receipt.createByUser);

  app
    .route("/card-info")
    .all(verifyToken.authUser)
    .get(cardInfo.readByUser)
    .post(cardInfo.createByUser)
    .delete(cardInfo.deleteByUser);

  /* Non User API */

  app
    .route("/account/non-user")
    .get(account.readByNonUser);

  app
    .route("/order/non-user")
    .get(orderNonUser.readByUser)
    .post(orderNonUser.createByUser)
    .put(orderNonUser.updateByUser);

  app
    .route("/delivery/non-user")
    .get(delivery.readByNonUser);
};