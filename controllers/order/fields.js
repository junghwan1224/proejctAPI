export default [
    {
        // 주문 시각
        name: "date",
        allowNull: false,
        type: "date",
    },
    {
        // 주문 항목
        name: "items",
        allowNull: false,
        type: "json",
    },
    {
        // 부가세 적용 여부 - true:별도 / false: 포함
        name: "vat",
        allowNull: false,
        type: "bool",
        defaultValue: true,
    },
    {
        // 거래액, 실제로 지불한 금액(KRW)
        name: "paid_amount",
        allowNull: false,
        type: "int",
    },
    {
        // 거래처 ID 혹은 상호명 문자열
        name: "client_id",
        allowNull: false,
        defaultValue: "",
        type: "str",
    },
    {
        // 거래 등록 사원 외래키
        name: "staff_id",
        allowNull: false,
        type: "str",
    },
    {
        // 해외 거래일 경우 관련 정보, 환율 등...
        name: "foreign_info",
        allowNull: false,
        defaultValue: {},
        type: "json",
    },
    {
        // 메모
        name: "memo",
        allowNull: false,
        defaultValue: "",
        type: "str",
    },
    {
        // 범주 - INCOME / EXPENSE
        name: "classification",
        allowNull: false,
        type: "str",
    },
    {
        // 구분 - 매출, 매입, 통관, 접대비, 재고자산감모손실, 등등등...
        name: "type",
        allowNull: false,
        type: "str",
    },
    {
        // 첨부파일
        name: "attachments",
        allowNull: false,
        defaultValue: {},
        type: "json",
    },
    {
        // 참고자료, 통관일 경우 어떤 주문에 대한 통관인지 등록할 수 있음
        name: "reference",
        allowNull: false,
        defaultValue: {},
        type: "json",
    },
];