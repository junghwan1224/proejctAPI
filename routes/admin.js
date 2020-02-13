module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const accountLevel = require("../controllers/accountLevel");
  const ADMIN_ROUTE = "/admin";
  app
    .route(ADMIN_ROUTE + "/account")
    .all(verifyToken.authAdmin)
    .delete(account.deleteByAdmin);

  app
    .route(ADMIN_ROUTE + "/account-level")
    .all(verifyToken.authAdmin)
    .post(accountLevel.createByAdmin)
    .get(accountLevel.readByAdmin);

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
