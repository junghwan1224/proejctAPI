module.exports = [
    {
        name: "product_id",
        type: "str",
        allowNull: false,
        
    },
    {
        name: "warehouse_id",
        type: "str",
        allowNull: false,
    },
    {
        name: "sector",
        type: "str",
        allowNull: false
    },
    {
        name: "quantity",
        type: "int",
        allowNull: false,
        defaultValue: 0
    },
    {
        name: "ea_per_unit",
        type: "int",
        allowNull: false,
        defaultValue: 0
    },
];