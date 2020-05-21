module.exports = (app) => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const accountList = require("../controllers/accountList");
  const login = require("../controllers/login");
  const accountLevel = require("../controllers/accountLevel");
  const certify = require("../controllers/certify");

  const admin = require("../controllers/admin");
  const product = require("../controllers/product");
  const productList = require("../controllers/productList");

  const orderList = require("../controllers/orderList");
  const delivery = require("../controllers/delivery");
  const deliveryList = require("../controllers/deliveryList");
  const deliveryPerUser = require("../controllers/deliveryPerUser");

  const payment = require("../controllers/payment");
  const creditTransaction = require("../controllers/creditTransaction");
  const creditTransactionList = require("../controllers/creditTransactionList");
  const receiptExternal = require("../controllers/receiptExternal");

  const roster = require("../controllers/roster");

  const staff = require("../controllers/staff");
  const staffList = require("../controllers/staffList");

  const supplier = require("../controllers/supplier");
  const supplierList = require("../controllers/supplierList");

  const domesticPurchase = require("../controllers/domesticPurchase");
  const domesticPurchaseList = require("../controllers/domesticPurchaseList");
  
  const address = require("../controllers/address");

  const inquiry = require("../controllers/inquiry");
  const inquiryList = require("../controllers/inquiryList");

  const ADMIN_ROUTE = "/admin";
  app
    .route(ADMIN_ROUTE + "/account")
    // .all(verifyToken.authAdmin)
    .get(account.readByAdmin)
    .post(account.createByUser)
    .put(account.updateByAdmin)
    .delete(account.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/staff")
    // .all(verifyToken.authAdmin)
    .post(staff.createByAdmin)
    .get(staff.readByAdmin)
    .put(staff.updateByAdmin)
    .delete(staff.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/staff-list")
    // .all(verifyToken.authAdmin)
    .get(staffList.readByAdmin);
  app
    .route(ADMIN_ROUTE + "/account-list")
    // .all(verifyToken.authAdmin)
    .get(accountList.readByAdmin);

  app.route(ADMIN_ROUTE + "/login").post(login.loginByAdmin);

  app
    .route(ADMIN_ROUTE + "/admin")
    // .all(verifyToken.authAdmin)
    .get(admin.readByAdmin)
    .post(admin.createByAdmin)
    .put(admin.updateByAdmin)
    .delete(admin.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/account-level")
    // .all(verifyToken.authAdmin)
    .post(accountLevel.createByAdmin)
    .get(accountLevel.readByUser);

  app
    .route(ADMIN_ROUTE + "/product-list")
    // .all(verifyToken.authAdmin);
    .get(productList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/crn-document")
    .post(certify.approveDocument)
    .delete(certify.deleteDocument);

  app
    .route(`${ADMIN_ROUTE}/product`)
    // .all(verifyToken.authAdmin)
    .post(product.createByAdmin)
    .get(product.readByAdmin)
    .put(product.updateByAdmin)
    .delete(product.deleteByAdmin);

  app.route(ADMIN_ROUTE + "/basket").all(verifyToken.authAdmin);

  app
    .route(ADMIN_ROUTE + "/order-list")
    // .all(verifyToken.authAdmin)
    .get(orderList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/delivery")
    // .all(verifyToken.authAdmin)
    .get(delivery.readByAdmin)
    .put(delivery.updateByAdmin);

  app
    .route(ADMIN_ROUTE + "/delivery-list")
    // .all(verifyToken.authAdmin)
    .get(deliveryList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/delivery-per-user")
    // .all(verifyToken.authAdmin)
    .get(deliveryPerUser.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/article")
    // .all(verifyToken.authAdmin)
    .get()
    .post()
    .put()
    .delete();

  app
    .route(ADMIN_ROUTE + "/payment/refund")
    // .all(verifyToken.authAdmin)
    .post(payment.refundByAdmin);

  app
    .route(ADMIN_ROUTE + "/credit-transaction")
    // .all(verifyToken.authAdmin)
    .get(creditTransaction.readByAdmin)
    .post(creditTransaction.createByAdmin)
    .put(creditTransaction.updateByAdmin)
    .delete(creditTransaction.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/credit-transaction/list")
    // .all(verifyToken.authAdmin)
    .get(creditTransactionList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/receipt-external")
    // .all(verifyToken.authAdmin)
    .get(receiptExternal.readByAdmin)
    .post(receiptExternal.createByAdmin);

  app
    .route(ADMIN_ROUTE + "/roster")
    // .all(verifyToken.authAdmin)
    .get(roster.readByAdmin)
    .post(roster.createByAdmin);

  app
    .route(ADMIN_ROUTE + "/supplier")
    // .all(verifyToken.authAdmin)
    .get(supplier.readByAdmin)
    .post(supplier.createByAdmin)
    .put(supplier.updateByAdmin)
    .delete(supplier.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/supplier-list")
    // .all(verifyToken.authAdmin)
    .get(supplierList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/domestic-purchase")
    .get(domesticPurchase.readByAdmin)
    .post(domesticPurchase.createByAdmin)
    .put(domesticPurchase.updateByAdmin)
    .delete(domesticPurchase.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/domestic-purchase-list")
    .get(domesticPurchaseList.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/address")
    // .all(verifyToken.authAdmin)
    .get(address.readByAdmin);

  app
    .route(ADMIN_ROUTE + "/inquiry")
    .get(inquiry.readByAdmin)
    .put(inquiry.updateByAdmin);

  app
    .route(ADMIN_ROUTE + "/inquiry-list")
    .get(inquiryList.readByAdmin);
};
