/**
 * PERMISSION MAP
 */
const verify = (originalFunction, permissionType = undefined) => {
  if (!permissionType) {
    return res.status(400).send();
  }

  return function (req, res, next) {
    const permission = parseInt(permissionType);
    const convertedPermissionValue = calculateMod(
      req.staff_permission,
      permission
    );

    if (req.headers.ping) {
      if (convertedPermissionValue === 0) {
        return res.status(200).send();
      }
      return res.status(403).send();
    }

    if (convertedPermissionValue === 0)
      return originalFunction.call(this, req, res, next);

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
  /* 제품 관리 권한: */
  CREATE_PRODUCT: 7,
  READ_PRODUCT: 11,
  EDIT_PRODUCT: 13,

  /* 사원 관리 권한: */
  CREATE_STAFF: 17,
  READ_STAFF: 19,
  EDIT_STAFF: 23,

  /* 주문 관련 권한: */
  CREATE_ORDER: 29,
  READ_ORDER: 31,
  EDIT_ORDER: 37,

  /* 거래처 관련 권한: */
  CREATE_CLIENT: 41,
  READ_CLIENT: 43,
  EDIT_CLIENT: 47,

  /* 창고 관리 권한: */
  CREATE_WAREHOUSE: 53,
  READ_WAREHOUSE: 59,
  EDIT_WAREHOUSE: 61,
};

const multiply = (a, b) => {
  /** https://stackoverflow.com/questions/1685680 */
  const product = Array(a.length + b.length).fill(0);
  for (let i = a.length; i--; null) {
    let carry = 0;
    for (let j = b.length; j--; null) {
      product[1 + i + j] += carry + a[i] * b[j];
      carry = Math.floor(product[1 + i + j] / 10);
      product[1 + i + j] = product[1 + i + j] % 10;
    }
    product[i] += carry;
  }
  return product.join("").replace(/^0*(\d)/, "$1");
};

export default { verify, TYPE, calculateMod, multiply };
