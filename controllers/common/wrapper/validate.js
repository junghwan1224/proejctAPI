/**
 * 테이블 필드 타입 및 입력값 검증
 * @param {*} fields 테이블 필드 정보, { name, type, allowNull, defaultValue }
 * @param {*} reqBody 클라이언트에서 요청 보낸 값
 */
const validateFields = (fields, reqBody) => {
  for (const field of fields) {
    let value = reqBody[field.name];
    // 클라이언트에서 보낸 데이터에 해당 값이 없는 경우 defaultValue로 지정
    if (value === undefined) value = field.defaultValue;

    // 클라이언트에서 보낸 데이터가 빈 문자열인 경우
    if (value === "") {
      // defaultValue가 존재하는 경우 -> 옵션(필수x) 값이므로 defaultValue로 지정
      if (field.defaultValue !== undefined) value = field.defaultValue;
      // defaultValue가 없는 경우 -> 필수 값이므로 false 반환
      else return false;
    }

    // 타입 검증, 검증 실패 시 false 반환
    switch (field.type) {
      case "str":
        if (!isValidStr(value)) return false;
        break;
      case "int":
        if (!isValidInt(value)) return false;
        break;
      case "json":
        if (!isValidJSON(value)) return false;
        break;
      case "bool":
        if (!isValidBool(value)) return false;
        break;
      case "date":
        if (!isValidDate(value)) return false;
        break;
      default:
        return false;
    }
  }

  return true;
};

// 문자열 타입 검증
const isValidStr = (value) => typeof value === "string";

// 정수 타입 검증
const isValidInt = (value) => typeof value === "number" && !NaN;

// Boolean 타입 검증
const isValidBool = (value) => [true, false].indexOf(value) > -1;

// JSON타입 검증
const isValidJSON = (value) => {
  try {
    var value = JSON.parse(str);
    return typeof value === "object";
  } catch (e) {
    return false;
  }
};

// Date 타입 검증
const isValidDate = (value) => Boolean(Date.parse(value));

export default validateFields;
