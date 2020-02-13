module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const product = require("../controllers/product");
  const productList = require("../controllers/productList");

  app
    .route("/account")
    .all(verifyToken.authUser)
    .get(account.readByUser)
    .put(account.updateByUser);

  app
    .post(account.createByUser)

  app
    .route("/product")
    .all((req, res, next) => {
      next();
    })
    .get(product.readByUser);

  app
    .route("/product-list")
    .all((req, res, next) => {
      next();
    })
    .get(productList.readByUser);

  app
    .route("/basket")
    .all((req, res, next) => {
    next();
  });

  app
    .route("/delivery")
    .all((req, res, next) => {
    next();
  });

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
