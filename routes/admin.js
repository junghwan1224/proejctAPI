module.exports = (app) => {
  const verifyToken = require("./verifyToken");
  const permission = require("./permission");
  const PTYPE = permission.TYPE;

  const login = require("../controllers/login");

  const staff = require("../controllers/staff");
  const staffList = require("../controllers/staffList");

  const ADMIN_ROUTE = "/admin";
  /**
   * @name CORE
   * @description Core Routes:
   * ----------------------------------------------------------------------- */
  app.route(ADMIN_ROUTE + "/login").post(login.loginByAdmin);
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

};
