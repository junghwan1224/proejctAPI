module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");

  app
    .route("/account")
    .all(verifyToken.authUser)
    .get(account.readByUser)
    .put(account.updateByUser);
  
  app
    .post(account.createByUser)

  app
    .route("/basket")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();

  app
    .route("/delivery")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();

  app
    .route("/delivery/list")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();

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
    .route("/product")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();

  app
    .route("/payment")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();

  app
    .route("/order")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();
  
  app
    .route("/receipt")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();
  
  app
    .route("/receipt-external")
    .all(verifyToken.authUser)
    .get()
    .post()
    .put()
    .delete();
};