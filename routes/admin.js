module.exports = app => {
  const account = require("../controllers/account");
  const accountLevel = require("../controllers/accountLevel");
  const admin = require("../controllers/admin");

  const ADMIN_ROUTE = "/admin";
  app
    .route(ADMIN_ROUTE + "/account")
    .all((req, res, next) => {
      next();
    })
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
    .all((req, res, next) => {
      next();
    })
    .post(accountLevel.createByAdmin)
    .get(accountLevel.readByAdmin);
};
