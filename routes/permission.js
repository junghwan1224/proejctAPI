/**
 * PERMISSION MAP
 */
const verify = (originalFunction, permissionType = null) => {
  return function (req, res, next) {
    if (permissionType) {
      const permission = parseInt(permissionType);
      if (calculateMod(req.staff_permission, permission) === 0)
        return originalFunction.call(this, req, res, next);
    }
    return res.status(403).send();
  };
};

const calculateMod = (str, mod) => {
  if (!str || !mod) {
    return 1;
  }
  var n = str.toString().length;
  if (n <= 10) {
    return parseInt(str) % mod;
  } else {
    var first = str.substring(0, n - 10);
    var second = str.substring(n - 10);
    return (
      (calculateMod(first, mod) * (Math.pow(10, 10) % mod) +
        (parseInt(second) % mod)) %
      mod
    );
  }
};

const TYPE = {
  /* 쇼핑몰 계정 관리 권한: */
  CREATE_ACCOUNT: "2",
  READ_ACCOUNT: "2",
  EDIT_ACCOUNT: "2",

  /* 제품 관리 권한: */
  CREATE_PRODUCT: "2",
  READ_PRODUCT: "2",
  EDIT_PRODUCT: "2",

  /* 사원 관리 권한: */
  CREATE_STAFF: "2",
  READ_STAFF: "2",
  EDIT_STAFF: "2",

  /* 주문, 배송 관련 권한: */
  CREATE_ORDER: "2",
  READ_ORDER: "2",
  EDIT_ORDER: "2",

  /* 거래처 관련 권한: */
  CREATE_SUPPLIER: "2",
  READ_SUPPLIER: "2",
  EDIT_SUPPLIER: "2",

  /* 국내 매입 관리 권한: */
  CREATE_DPURCHASE: "2",
  READ_DPURCHASE: "2",
  EDIT_DPURCHASE: "2",

  /* 쇼핑몰 문의하기 관련 권한: */
  CREATE_INQUIRY: "2",
  READ_INQUIRY: "2",
  EDIT_INQUIRY: "2",
};

module.exports = { verify, TYPE };
