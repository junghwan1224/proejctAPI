module.exports = (app) => {
  const verifyToken = require("./verifyToken");
  const permission = require("./permission");
  const PTYPE = permission.TYPE;

  const account = require("../controllers/account");
  const accountList = require("../controllers/accountList");
  const login = require("../controllers/login");
  const accountLevel = require("../controllers/accountLevel");
  const certify = require("../controllers/certify");

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
  /**
   * @name CORE
   * @description Core Routes:
   * ----------------------------------------------------------------------- */
  app.route(ADMIN_ROUTE + "/login").post(login.loginByAdmin);
  /* ----------------------------------------------------------------------- */

  /**
   * @name ACCOUNT
   * @description Account Related Routes:
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/account")
    .all(verifyToken.authAdmin)
    .get(permission.verify(account.readByAdmin, PTYPE.READ_ACCOUNT))
    // .post(permission.verify(account.createByAdmin, PTYPE.CREATE_ACCOUNT))
    .put(permission.verify(account.updateByAdmin, PTYPE.EDIT_ACCOUNT))
    .delete(permission.verify(account.deleteByAdmin, PTYPE.EDIT_ACCOUNT));
  app
    .route(ADMIN_ROUTE + "/account-list")
    .all(verifyToken.authAdmin)
    .get(permission.verify(accountList.readByAdmin, PTYPE.READ_ACCOUNT));
  app
    .route(ADMIN_ROUTE + "/account-level")
    .all(verifyToken.authAdmin)
    .post(permission.verify(accountLevel.createByAdmin, PTYPE.CREATE_ACCOUNT))
    .get(permission.verify(accountLevel.readByUser, PTYPE.READ_ACCOUNT));
  app
    .route(ADMIN_ROUTE + "/crn-document")
    .all(verifyToken.authAdmin)
    .post(permission.verify(certify.approveDocument, PTYPE.EDIT_ACCOUNT))
    .delete(permission.verify(certify.deleteDocument, PTYPE.EDIT_ACCOUNT));
  app
    .route(ADMIN_ROUTE + "/address")
    .all(verifyToken.authAdmin)
    .get(permission.verify(address.readByAdmin, PTYPE.READ_ACCOUNT));
  /* ----------------------------------------------------------------------- */

  /**
   * @name PRODUCT
   * @description Product Related Routes:
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/product-list")
    .all(verifyToken.authAdmin)
    .get(permission.verify(productList.readByAdmin, PTYPE.READ_PRODUCT));
  app
    .route(`${ADMIN_ROUTE}/product`)
    .all(verifyToken.authAdmin)
    .post(permission.verify(product.createByAdmin, PTYPE.CREATE_PRODUCT))
    .get(permission.verify(product.readByAdmin, PTYPE.READ_PRODUCT))
    .put(permission.verify(product.updateByAdmin, PTYPE.EDIT_PRODUCT))
    .delete(permission.verify(product.deleteByAdmin, PTYPE.EDIT_PRODUCT));
  /* ----------------------------------------------------------------------- */

  /**
   * @name PURCHASE
   * @description Purchase Related Routes:
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/domestic-purchase")
    .get(permission.verify(domesticPurchase.readByAdmin, PTYPE.READ_DPURCHASE))
    .post(
      permission.verify(domesticPurchase.createByAdmin, PTYPE.CREATE_DPURCHASE)
    )
    .put(
      permission.verify(domesticPurchase.updateByAdmin, PTYPE.EDIT_DPURCHASE)
    )
    .delete(
      permission.verify(domesticPurchase.deleteByAdmin, PTYPE.EDIT_DPURCHASE)
    );
  app
    .route(ADMIN_ROUTE + "/domestic-purchase-list")
    .get(
      permission.verify(domesticPurchaseList.readByAdmin, PTYPE.READ_DPURCHASE)
    );
  /* ----------------------------------------------------------------------- */

  /**
   * @name ORDER/DELIVERY
   * @description Order / Delivery Related Routes:
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/order-list")
    .all(verifyToken.authAdmin)
    .get(permission.verify(orderList.readByAdmin, PTYPE.READ_ORDER));
  app
    .route(ADMIN_ROUTE + "/delivery")
    .all(verifyToken.authAdmin)
    .get(permission.verify(delivery.readByAdmin, PTYPE.READ_ORDER))
    .put(permission.verify(delivery.updateByAdmin, PTYPE.EDIT_ORDER));
  app
    .route(ADMIN_ROUTE + "/delivery-list")
    .all(verifyToken.authAdmin)
    .get(permission.verify(deliveryList.readByAdmin, PTYPE.READ_ORDER));
  app
    .route(ADMIN_ROUTE + "/delivery-per-user")
    .all(verifyToken.authAdmin)
    .get(permission.verify(deliveryPerUser.readByAdmin, PTYPE.READ_ORDER));
  app
    .route(ADMIN_ROUTE + "/payment/refund")
    .all(verifyToken.authAdmin)
    .post(permission.verify(payment.refundByAdmin, PTYPE.EDIT_ORDER));
  app
    .route(ADMIN_ROUTE + "/credit-transaction")
    .all(verifyToken.authAdmin)
    .get(permission.verify(creditTransaction.readByAdmin, PTYPE.READ_ORDER))
    .post(
      permission.verify(creditTransaction.createByAdmin, PTYPE.CREATE_ORDER)
    )
    .put(permission.verify(creditTransaction.updateByAdmin, PTYPE.EDIT_ORDER))
    .delete(
      permission.verify(creditTransaction.deleteByAdmin, PTYPE.EDIT_ORDER)
    );
  app
    .route(ADMIN_ROUTE + "/credit-transaction/list")
    .all(verifyToken.authAdmin)
    .get(
      permission.verify(creditTransactionList.readByAdmin, PTYPE.READ_ORDER)
    );
  app
    .route(ADMIN_ROUTE + "/receipt-external")
    .all(verifyToken.authAdmin)
    .get(permission.verify(receiptExternal.readByAdmin, PTYPE.READ_ORDER))
    .post(permission.verify(receiptExternal.createByAdmin, PTYPE.CREATE_ORDER));
  app
    .route(ADMIN_ROUTE + "/roster")
    .post(permission.verify(roster.createByAdmin, PTYPE.CREATE_ORDER));
  /* ----------------------------------------------------------------------- */

  /**
   * @name STAFF
   * @description Staff Related Routes
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/staff")
    .all(verifyToken.authAdmin)
    .post(permission.verify(staff.createByAdmin, PTYPE.CREATE_STAFF))
    .get(permission.verify(staff.readByAdmin, PTYPE.READ_STAFF))
    .put(permission.verify(staff.updateByAdmin, PTYPE.EDIT_STAFF))
    .delete(permission.verify(staff.deleteByAdmin, PTYPE.EDIT_STAFF));
  app
    .route(ADMIN_ROUTE + "/staff-list")
    .all(verifyToken.authAdmin)
    .get(permission.verify(staffList.readByAdmin, PTYPE.READ_STAFF));
  /* ----------------------------------------------------------------------- */

  /**
   * @name INQUIRY
   * @description Inquiry Related Routes:
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/inquiry")
    .all(verifyToken.authAdmin)
    .get(permission.verify(inquiry.readByAdmin, PTYPE.READ_INQUIRY))
    .put(permission.verify(inquiry.updateByAdmin, PTYPE.EDIT_INQUIRY));
  app
    .route(ADMIN_ROUTE + "/inquiry-list")
    .all(verifyToken.authAdmin)
    .get(permission.verify(inquiryList.readByAdmin, PTYPE.READ_INQUIRY));
  /* ----------------------------------------------------------------------- */

  /**
   * @name SUPPLIER
   * @description Supplier Related Routes:
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/supplier")
    .all(verifyToken.authAdmin)
    .get(permission.verify(supplier.readByAdmin, PTYPE.CREATE_SUPPLIER))
    .post(permission.verify(supplier.createByAdmin, PTYPE.READ_SUPPLIER))
    .put(permission.verify(supplier.updateByAdmin, PTYPE.EDIT_SUPPLIER))
    .delete(permission.verify(supplier.deleteByAdmin, PTYPE.EDIT_SUPPLIER));
  app
    .route(ADMIN_ROUTE + "/supplier-list")
    .all(verifyToken.authAdmin)
    .get(permission.verify(supplierList.readByAdmin, PTYPE.READ_SUPPLIER));
  /* ----------------------------------------------------------------------- */
};
