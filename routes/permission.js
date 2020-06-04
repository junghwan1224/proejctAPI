/**
 * PERMISSION MAP
 */
const verify = (originalFunction, permissionType = undefined) => {
  const permission = parseInt(permissionType);

  return function (req, res, next) {
    if(req.headers.ping) {
      if(calculateMod(req.staff_permission, permission) === 0) {
        return res.status(200).send();
      }
      return res.status(403).send();
    }

    else {
      if (permissionType) {
        if (calculateMod(req.staff_permission, permission) === 0)
          return originalFunction.call(this, req, res, next);
      }
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
  CREATE_ACCOUNT: 2,
  READ_ACCOUNT: 3,
  EDIT_ACCOUNT: 5,

  /* 제품 관리 권한: */
  CREATE_PRODUCT: 7,
  READ_PRODUCT: 11,
  EDIT_PRODUCT: 13,

  /* 사원 관리 권한: */
  CREATE_STAFF: 17,
  READ_STAFF: 19,
  EDIT_STAFF: 23,

  /* 주문, 배송 관련 권한: */
  CREATE_ORDER: 29,
  READ_ORDER: 31,
  EDIT_ORDER: 37,

  /* 거래처 관련 권한: */
  CREATE_SUPPLIER: 41,
  READ_SUPPLIER: 43,
  EDIT_SUPPLIER: 47,

  /* 국내 매입 관리 권한: */
  CREATE_DPURCHASE: 53,
  READ_DPURCHASE: 59,
  EDIT_DPURCHASE: 61,

  /* 쇼핑몰 문의하기 관련 권한: */
  CREATE_INQUIRY: 67,
  READ_INQUIRY: 71,
  EDIT_INQUIRY: 73,
};

module.exports = { verify, TYPE, calculateMod };
