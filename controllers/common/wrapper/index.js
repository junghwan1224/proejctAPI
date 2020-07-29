import _validateFields from "./validate";

class ControlWrapper {
  /**
   * Response Handler
   * @param {object} model Sequelize 모델 오브젝트
   * @param {object} fields 모델의 규격이 정의된 Field 오브젝트
   * @param {object} req server request object
   * @param {object} res server response object
   * @param {object} locator 데이터를 특정지을 수 있는 조건
   */

  async init(model, fields, req, res, locator) {
    this.model = model;
    this.fields = fields;
    this.req = req;
    this.res = res;
    this.locator = locator;
    this.status_code = undefined;
    this.data = undefined;
  }

  setResponse({ code, data }) {
    this.status_code = code;
    this.data = data;
  }

  /**
   * 해당 클래스 연산 종료 및 response 반환
   */
  send() {
    this.res.status(this.status_code).send(this.data);
  }

  /**
   * 누락된 value들을 기존 데이터로 보완
   */
  async supplement() {
    if (this.status_code !== undefined) return;

    /** 기존 데이터 가져오기: */
    const prevData = await this.model.findOne({
      where: this.locator,
    });
    if (!prevData) {
      this.setResponse({
        code: 400,
        data: {
          message: "데이터가 존재하지 않습니다.",
        },
      });
      return;
    }

    let supplementedReq = prevData.dataValues;
    for (const key of Object.keys(this.req.body)) {
      supplementedReq[key] = this.req.body[key];
    }

    supplementedReq.createdAt = undefined;
    supplementedReq.updatedAt = undefined;
    this.req.body = supplementedReq;
  }

  /**
   * 입력받은 데이터가 기준을 충족하지 않을 경우 - 400 반환
   */
  validate() {
    if (this.status_code !== undefined) return;

    if (!_validateFields(this.fields, this.req.body))
      this.setResponse({
        code: 400,
        data: { message: "필요한 패러미터가 누락되었습니다." },
      });
  }

  /**
   * 해당조건의 데이터가 존재하지 않을 경우 - 400 반환
   */
  async exist() {
    if (this.status_code !== undefined) return;

    try {
      const response = await this.model.findOne({
        where: this.locator,
      });
      if (!response) {
        this.setResponse({
          code: 400,
          data: { message: "데이터가 존재하지 않습니다." },
        });
      }
    } catch (err) {
      console.log(err);
      this.setResponse({
        code: 400,
        data: { message: "에러가 발생했습니다." },
      });
    }
  }

  /**
   * 해당조건의 데이터가 존재할 경우 - 400 반환
   */
  async unique() {
    if (this.status_code !== undefined) return;

    const response = await this.model.findOne({
      where: this.locator,
    });
    if (response) {
      this.setResponse({
        code: 400,
        data: { message: "데이터가 이미 존재합니다." },
      });
    }
  }

  async post() {
    if (this.status_code !== undefined) return;

    try {
      const response = await this.model.create(this.req.body);
      this.setResponse({
        code: 201,
        data: { message: response.id },
      });
    } catch (err) {
      console.log(err);
      this.setResponse({
        code: 400,
        data: { message: "에러가 발생했습니다." },
      });
    }
  }

  async get() {
    if (this.status_code !== undefined) return;

    try {
      const response = await this.model.findOne({ where: this.locator });
      this.setResponse({
        code: 200,
        data: response,
      });
    } catch (err) {
      console.log(err);
      this.setResponse({
        code: 400,
        data: { message: "에러가 발생했습니다." },
      });
    }
  }

  async patch() {
    if (this.status_code !== undefined) return;

    try {
      await this.model.update(this.req.body, {
        where: this.locator,
      });
      this.setResponse({
        code: 200,
        data: { message: "성공적으로 업데이트 되었습니다." },
      });
    } catch (err) {
      console.log(err);
      this.setResponse({
        code: 400,
        data: { message: "에러가 발생했습니다." },
      });
    }
  }

  async delete() {
    if (this.status_code !== undefined) return;

    try {
      await this.model.destroy({
        where: this.locator,
      });
      this.setResponse({
        code: 200,
        data: undefined,
      });
    } catch (err) {
      console.log(err);
      this.setResponse({
        code: 400,
        data: { message: "에러가 발생했습니다." },
      });
    }
  }
}

export default ControlWrapper;
