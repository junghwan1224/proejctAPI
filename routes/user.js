module.exports = app => {
  const verifyToken = require("./verifyToken");

  const account = require("../controllers/account");
  const login = require("../controllers/login");
  const product = require("../controllers/product");
  const productList = require("../controllers/productList");

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
