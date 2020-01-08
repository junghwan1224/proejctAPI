## API 명세

- ### routes

  - ### account (`/api/account`)

    - `GET` `/exist` 계정 존재 여부 확인
      - query: `phone`
    - `POST` `/login` 로그인
      - body: `phone` `password`
    - `GET` `/read` 유저 정보 조회
      - query: `account_id`
    - `POST` `/create` 회원가입
      - body: `phone` `name` `crn(사업자등록번호)` `password`
    - `POST` `/issue-certify-num` 인증번호 문자 전송
      - body: `phone`
    - `POST` `/certify` 인증번호 비교 및 인증
      - body: `certifyNumber(유저가 입력한 인증번호)`
    - `GET` `/get-address` 유저의 입력된 주소 조회
      - token: `account_id`
    - `POST` `/set-address` 주소 설정
      - token: `account_id`
      - body: `addr_postcode` `addr_primary` `addr_detail`
    - `POST` `/set-email` 이메일 설정
      - token: `account_id`
      - body: `email`
    - `POST` `/change-pwd` 비밀번호 변경
      - token: `account_id`
      - body: `password` `new_password`
    - `POST` `/set-new-pwd` 새 비밀번호 설정
      - body: `phone` `new_password`
    - `POST` `/issue-temporary-pwd` 임시 비밀번호 발급
      - body: `phone`
    - `DELETE` `/` 계정 삭제(회원 탈퇴)
      - token: `account_id`

    

    - `ACCOUNT ARK(전산)`

    - `GET` `/ark/read` 유저 조회

      - query: `account_id`

    - `POST` `/ark/create` (외상거래)유저 생성

      - body: `phone` `username` `crn`

    - `POST` `/ark/set-address` 유저 주소 설정

      - body: `account_id` `postcode` `addr_primary` `addr_detail`

    - `GET` `/ark/get-address` 유저 주소 조회

      - query: `account_id`

      

  - ### address(`/api/address`)

    - `GET` `/read` 주소 조회

      - query: `account_id`

      

  - ### article(`/api/article`)

    - `GET` `/list` 공지사항 리스트 조회

      - query: `type` `size(한 페이지에 보여줄 리스트 갯수)`

    - `GET` `/read` 공지사항 글 조회

      - query: `id`

    - `POST` `/create` 공지사항 생성

      - body: `type` `title` `date` `contents` `attachment`

      

  - ### basket(`/api/basket`)

    - `GET` `/read` 장바구니 목록 조회
      - query: `account_id`
    - `POST` `/create-or-update` 장바구니에 제품 추가 or 기존에 있는 제품인 경우 내용만 수정
      - body: `account_id` `products`

  - ### delivery(`/api/delivery`)

    - `GET` `/all` 구매한 모든 제품의 배송현황 리스트 조회

      - token: `account_id`

    - `GET` `/:order_id` 배송현황 상세 조회

      - params: `order_id`

    - `PUT` `/status/:order_id` 배송 상태 업데이트

      - params: `order_id`
      - body: `status`

    - `PUT` `/location/:order_id` 배송 위치 업데이트

      - params: `order_id`
      - body: `location`

      

    - `DELIVERY ARK(전산)`

    - `GET` `/ark/list` 배송 현황 리스트 조회

    - `GET` `/ark/detail` 배송 현황 상세 조회

      - query: `order_id`

    - `GET` `/ark/user` 유저의 주문 배송 현황 조회

      - query: `account_id`

      

  - ### favorite(`/api/favorite`)

    - `GET` `/list` 관심상품 리스트 조회
      - token: `account_id`
    - `POST` `/toggle` 관심상품 추가
      - token: `account_id`
      - body: `product_id`

  - ### inquiry(`/api/inquiry`)

    - `POST` `/mail` 문의하기
      - body: `phone` `poc` `title` `content` `type` `date` `username` 

  - ### payment(`/api/payment`)

    - `GET` `/order-info` 주문완료 정보 조회, purchaseComplete 페이지 렌더링 위해 사용

      - token: `account_id`
      - query: `order_id`

    - `POST` `/complete` 결제 검증 최종 단계, 금액 비교 후 상태 및 재고 수량 업데이트

      - token: `account_id`
      - body: `imp_uid` `merchant_uid`

    - `POST` `/save-order` 결제 요청 전 주문 데이터 저장

      - token: `account_id`
      - body: `merchant_uid` `products(array)` `pay_method` `name` `amount(array)` `quantity(array)` `address_id` `buyer_email` `addrArray` `buyer_postcode`, `memo`

    - `POST` `/iamport-webhook` 몬타 서버와 아임포트 서버의 결제 정보를 동기화 시키기 위한 api

      - body: `imp_uid` `merchant_uid`

    - `POST` `/issue-billing` 카드 정보 저장

      - token: `account_id`
      - body: `card_number(카드번호)` `expriy(카드 유효기간)` `birth(생년월일)` `pwd_2digit(카드 비밀번호 앞 2자리)`

    - `DELETE` `/delete-billing` 카드 정보 삭제

      - body: `customer_uid`

    - `POST` `/billing` 저장된 카드로 결제(간편 결제)

      - token: `account_id`
      - body: `customer_uid` `merchant_uid` `name` `amount` `buyer_email` `buyer_name` `buyer_tel` `buyer_addr` `buyer_postcode`

    - `POST` `/refund` 주문 취소(환불)

      - token: `account_id`
      - body: `imp_uid` `reason(환불사유)`

    - `POST` `/cancel` 주문 취소 - 결제 검증 도중 에러가 발생했을 시 호출하는 api

      - token: `account_id`
      - body: `merchant_uid` `reason`

    - `POST` `/issue-receipt` 영수증 발급

      - token: `account_id`
      - body: `order_id` `identifier(현금영수증 발행대상 식별정보-사업자등록번호, 주민등록번호 등)` `identifier_type(현금영수증 발행대상 식별정보 유형)` `type(현금영수증 발행 타입 - 소득공제용(개인), 지출증빙용(법인))`

      

    - `PAYMENT ARK`

    - `POST` `/ark/save-order` 전산에서 주문 생성

      - body: `account_id` `merchant_uid` `products` `pay_method` `name` `amount` `quantity` `address_id` `addrArray` `buyer_postcode` `memo`

    - `POST` `/ark/refund` 전산에서 주문 취소

      - body: `account_id` `imp_uid` `reason`

      

  - ### product(`/api/product`)

    - `GET` `/find-by-oen` oe번호로 검색

      - query: `category` `oen`

    - `GET` `/find-by-type` 부품 타입으로 검색

      - query: `category` `type`

    - `GET` `/find-by-maker` 부품 검색 후 동일한 oe 번호 제품(여러개일 경우) 조회

      - query: `category` `oe_number`

    - `GET` `/find-by-car` 연식, 브랜드, 모델 필터링을 통한 검색

      - query: `category` `year` `brand` `model`

    - `GET` `/` 모든 제품 조회

    - `GET` `/abstract/list` product abstract 조회

    - `GET` `/read` 

      - query: `category` `brand`

      

    - `PRODUCT ARK`

    - `POST` `/ark/create/product` 전산에서 제품 등록

      - body: `abstract_id` `category` `brand` `model` `oe_number` `start_year` `end_year` `engine` `price` `discount_rate` `memo` `description` `quality_cert` `is_public`

    - `POST` `/ark/create/product-abstract` 전산에서 제품 등록

      - body: `id`  `maker`  `maker_number` `image` `stock` `type`

    - `GET` `/ark/product-list` 제품 리스트 조회

    - `GET` `/ark/product-detail` 제품 상세 조회

      - query: `productID`

    - `POST` `/ark/update-product` 제품 내용 업데이트

      - body: `productID` `productAbstractID` `brand` `model` `oe_number` `start_year` `end_year` `engine` `price` `discount_rate` `quality_rate` `product_abstract` `is_public`

    - `GET` `/fetch-all` 모든 제품 조회

  - ### roster(`/api/roster`)

    - `GET` `/` 당일 배송 출발, 도착 시간 조회
    - `POST` `/create` 시간표 생성

  - ### transaction(`/api/transaction`)

    - `GET` `/ark/all` 거래내역 조회(전산)
    - `GET` `/ark/detail` 거래내역 상세 조회(전산)
      - query: `merchant_uid`
    - `POST` `/ark/complete-credit` 외상거래 완료 상태 업데이트
      - body: `merchant_uid`
    - `POST` `/ark/cancel-credit` 외상거래 취소
      - body: `merchant_uid`
    - `DELTE` `/ark/credit` 주문 삭제
      - body: `merchant_uid`

  - ### verifyToken(`/api/verify-token`)

    - 토큰 인증 미들웨어

  - ### verify

    - 토큰 인증 미들웨어



## Model 명세

- `account` 계정
- `address` 유저 주소
- `article` 공지사항
- `basket` 장바구니
- `card_info` 카드 정보
- `delivery` 배송 현황 정보
- `favorite` 관심 제품
- `order` 주문
- `product_abstract` 제품
- `product` 제품
- `purchase_list` 수입 현황
- `roster` 순회차 스케줄
- `sales_list` 수출 현황



## 그 외

- `tools` 상품 DB 필드 및 Map File, Roster DB 필드 생성 파이썬 코드
- `public/js/signature.js` nCloud SENS API 사용을 위한 makeSignature 함수 작성
- `config/config.json` DB 연결 설정
- `.env` 노출되어서는 안되는 값들을 환경변수로 설정