import { authStaff } from './verifyToken';
import permission from './permission';

import login from '../controllers/core/login';
import staff from '../controllers/staff/crud';
import staffList from '../controllers/list/staff';
import warehouse from '../controllers/warehouse/crud';
import inventory from '../controllers/inventory/crud';

module.exports = (app) => {
  const PTYPE = permission.TYPE;
  const ADMIN_ROUTE = "/admin";
  
  /**
   * @name CORE
   * @description Core Routes:
   * ----------------------------------------------------------------------- */
  app.route(ADMIN_ROUTE + "/login").post(login);
  /* ----------------------------------------------------------------------- */

  /**
   * @name STAFF
   * @description Staff Related Routes
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/staff")
    .all(authStaff)
    .post(permission.verify(staff.createByAdmin, PTYPE.CREATE_STAFF))
    .get(permission.verify(staff.readByAdmin, PTYPE.READ_STAFF))
    .put(permission.verify(staff.updateByAdmin, PTYPE.EDIT_STAFF))
    .delete(permission.verify(staff.deleteByAdmin, PTYPE.EDIT_STAFF));
  app
    .route(ADMIN_ROUTE + "/staff-list")
    .all(authStaff)
    .get(permission.verify(staffList.readByAdmin, PTYPE.READ_STAFF));
  /* ----------------------------------------------------------------------- */

  /**
   * @name WAREHOUSE
   * @description Warehouse Related Routes
   * ----------------------------------------------------------------------- */
  app
    .route(ADMIN_ROUTE + "/warehouse")
    .all(authStaff)
    .get(permission.verify(warehouse.readByAdmin, PTYPE.READ_WAREHOUSE))
    .post(permission.verify(warehouse.createByAdmin, PTYPE.CREATE_WAREHOUSE))
    .put(permission.verify(warehouse.updateByAdmin, PTYPE.EDIT_WAREHOUSE))
    .delete(permission.verify(warehouse.deleteByAdmin, PTYPE.EDIT_WAREHOUSE));
  /* ----------------------------------------------------------------------- */

  /**
   * @name INVENTORY
   * @description Inventory Related Routes
   */
  app
    .route(ADMIN_ROUTE + "/inventory")
    .all(authStaff)
    .get(permission.verify(inventory.readByAdmin, PTYPE.READ_WAREHOUSE))
    .post(permission.verify(inventory.createByAdmin, PTYPE.EDIT_WAREHOUSE))
    .put(permission.verify(inventory.updateByAdmin, PTYPE.EDIT_WAREHOUSE))
    .delete(permission.verify(inventory.deleteByAdmin, PTYPE.EDIT_WAREHOUSE))
  /* ----------------------------------------------------------------------- */
};
