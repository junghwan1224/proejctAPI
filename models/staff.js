import bcrypt from "bcryptjs";
import uuid from "uuid";

export default (sequelize, DataTypes) => {
  const staff = sequelize.define(
    "staff",
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      department: DataTypes.STRING,
      rank: DataTypes.STRING,
      permission: DataTypes.STRING,
    },
    {
      hooks: {
        beforeCreate: (staff, options) => {
          {
            // hash password before storing it into DB
            staff.password =
              staff.password && staff.password != ""
                ? bcrypt.hashSync(staff.password, 10)
                : "";

            //add uuid for id
            staff.id = uuid.v4();
          }
        },
        beforeUpdate: (staff, options) => {
          // if(options.fields.includes("password")) {
          //   const { password } = staff.dataValues;
          //   staff.password = bcrypt.hashSync(password, 10);
          // }
        },
      },
    }
  );
  staff.associate = function (models) {};
  return staff;
};
