"use strict";

const Product = require("../models").product;

// exports.readByUser = async (req, res) => {
//   /* Allow pre-defined attributes only:  */
//   const ALLOWED_ATTRIBUTES = [
//     "id",

//     "phone",
//     "name",
//     "email",
//     "crn",
//     "type",
//     "mileage",
//     "level"
//   ];
//   const fields = req.query.fields || "";
//   const account_id = req.query.account_id;

//   /* Fetch account data including level attributes:  */
//   try {
//     const response = await Account.findOne({
//       where: { id: account_id },
//       attributes: ALLOWED_ATTRIBUTES,
//       include: [
//         {
//           model: AccountLevel,
//           required: true,
//           as: "level_detail",
//           attributes: ["discount_rate"]
//         }
//       ]
//     });

//     /* Return attributes based on the user request(parameters): */
//     if (response) {
//       const attributes = fields.toLowerCase().split(",");
//       let data = {};
//       if (fields.toLowerCase() != "all") {
//         attributes.map(
//           attribute => (data[attribute.trim()] = response[attribute.trim()])
//         );
//       } else {
//         data = response;
//       }
//       return res.status(200).send(data);
//     } else {
//       return res.status(400).send({ message: "User data not found." });
//     }
//   } catch (err) {
//     return res
//       .status(400)
//       .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
//   }
// };
