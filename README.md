# DB 정리

> DB 테이블 정리

---

## Accounts

### Fields (동일)

- id: UUID
- level: string
- phone: string
- password: string
- name: string
- crn: string
- mileage: int
- email: string
- crn_document: string

## Account_levels

### Fields (동일)

- id: str, NORMAL 등
- discount_rate: float

## Account_addresses (addresses)

### Fields (동일)

- id: UUID
- account_id: UUID
- postcode: string
- primary: string
- detail: string

## Account_cards (card_infos)

### Fields (동일)

- id: UUID
- account_id: UUID
- customer_uid: string
- card_name: string
- card_number: string

## Carts (baskets)

### Fields (동일)

- id: UUID
- account_id: UUID
- product_id: UUID
- quantity: int

## Deliveries

### Fields (동일)

- id: UUID
- account_id
- delivery_num
- order_id
- status
- location
- shipping_postcode
- shipping_primary
- shipping_detail
- courier
- invoice
- arrived_at

## domestic_purchases

### Fields

- id: UUID
- product_id
- quantity
- price

## purchase_mappers

### Fields

- id = str, D-20YY-MM-DD-RRRR, F-20YY-MM-DD-RRRR
- staff_id: UUID
- supplier_id: UUID
- date: date
- verified: bool
- memo: text

## suppliers

### Fields (동일)

- id: UUID
- address: text
- name: stringg
- crn: string
- poc: string
- fax: string
- alias: string
- worker: string
- worker_poc: string
- memo: text
- staff_id: UUID
-

## products

### Fields (동일)

- id: UUID
- images: text
- maker:
- maker_number
- allow_discount
- price
- models
- oe_number
- quality_cert
- maker_origin
- memo
- description_images
- is_public
- type
- attributes
- tags

## warehouses

### Fields

- id: UUID
- name: str
- location: text
- memo: text

## warehouse_mappers

- id: UUID
- warehouse_id: UUID
- product_id: UUID
- quantity: int

## staff_warehouse_mappers

- id: UUID
- staff_id: UUID
- warehouse_id: UUID
- product_id: UUID
- quantity: int

## stock_reports

- id: UUID
- code: str 4 digit
- product_id: UUID
- account_id: UUID, allow_null
