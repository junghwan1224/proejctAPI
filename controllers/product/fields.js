export default [
    {
        // 제품명
        name: "name",
        type: "str",
        allowNull: false,
    },
    {
        // 단위(EA, SET, ...)
        name: "unit",
        type: "str",
        allowNull: false,
    },
    {
        // 규격(외경, 내경, ...)
        name: "specification",
        type: "str",
        allowNull: false,
        defaultValue: "",
    },
    {
        // 분류명
        name: "type",
        type: "str",
        allowNull: false,
      },
    {
        // 가격 A (초기값 0, 단위: KRW)
        name: "price_a",
        type: "int",
        allowNull: false,
        defaultValue: 0,
    },
    {
        // 가격 B (초기값 0, 단위: KRW)
        name: "price_b",
        type: "int",
        allowNull: false,
        defaultValue: 0,
    },
    {
        // 가격 C (초기값 0, 단위: KRW)
        name: "price_c",
        type: "int",
        allowNull: false,
        defaultValue: 0,
    },
    {
        // 가격 D (초기값 0, 단위: KRW)
        name: "price_d",
        type: "int",
        allowNull: false,
        defaultValue: 0,
    },
    {
        // 가격 E (초기값 0, 단위: KRW)
        name: "price_e",
        type: "int",
        allowNull: false,
        defaultValue: 0,
    },
    {
        // 적정 재고
        name: "essential_stock",
        type: "int",
        allowNull: false,
        defaultValue: 0,
    },
    {
        // 메모
        name: "memo",
        type: "str",
        allowNull: false,
        defaultValue: "",
    },
    {
        // 제품 이미지 URL
        name: "image",
        type: "str",
        allowNull: false,
        defaultValue: "",
    },
];