const calculateDiscount = (USER_DISCOUNT, DB_PRICE, ALLOW_DISCOUNT) => {
  /**
   * --------------------------------------
   * PARAMETER       | TYPE  |  EXAMPLE
   * --------------------------------------
   * USER_DISCOUNT   | float |  0.03
   * DB_PRICE        | int   |  12000
   * ALLOW_DISCOUNT  | bool  |  true
   * --------------------------------------
   */
  const DEFAULT_DISCOUNT = parseFloat(process.env.DEFAULT_DISCOUNT);

  let price = null;
  let discountRate = null;
  const originalPrice =
    Math.round((DB_PRICE * (1 + DEFAULT_DISCOUNT)) / 10) * 10;

  if (USER_DISCOUNT === undefined) {
    price = originalPrice;
    discountRate = 0;
  } else {
    if (ALLOW_DISCOUNT) {
      price = Math.round((DB_PRICE * (1 - USER_DISCOUNT)) / 10) * 10;
      discountRate = Math.round((DEFAULT_DISCOUNT + USER_DISCOUNT) * 100);
    } else {
      price = Math.round(DB_PRICE / 10) * 10;
      discountRate = Math.round(DEFAULT_DISCOUNT * 100);
    }
  }
  return { price, discountRate, originalPrice };
};

module.exports = { calculateDiscount };
