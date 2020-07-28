import _validateFields from "./validate";

class ControlWrapper {
  /**
   * Response Handler
   * @param {object} model Sequelize 모델 오브젝트
   * @param {object} fields 모델의 규격이 정의된 Field 오브젝트
   */

  constructor(model, fields) {
    this.model = model;
    this.fields = fields;
    this.req = null;
    this.res = null;
    this.value = undefined;
  }

  terminate() {
    if (this.value !== undefined) return true;
  }

  through(_function) {
    !this.terminate() ? _function() : null;
    return this;
  }

  /**
   * 해당 클래스 연산 시작
   * @param {object} req server request object
   * @param {object} res server response object
   * @param {object} locator 데이터를 특정지을 수 있는 조건
   */
  init(req, res, locator) {
    this.req = req;
    this.res = res;
    this.locator = locator;
    this.value = undefined;
    return this;
  }

  /**
   * 해당 클래스 연산 종료 및 response 반환
   */
  _end() {
    return this.value;
  }

  /**
   * 누락된 value들을 기존 데이터로 보완
   */
  supplement() {
    return this.through(async () => {
      /** 기존 데이터 가져오기: */
      const prevData = await this.model.findOne({
        where: this.locator,
      });
      if (!prevData) {
        this.value = this.res
          .status(400)
          .send({ message: "데이터가 존재하지 않습니다." });
        return;
      }

      let supplementedReq = prevData.dataValues;
      supplementedReq.createdAt = undefined;
      supplementedReq.updatedAt = undefined;

      for (const key of Object.keys(this.req.body)) {
        supplementedReq[key] = this.req.body[key];
      }

      this.req.body = supplementedReq;
    });
  }

  /**
   * 입력받은 데이터가 기준을 충족하지 않을 경우 - 400 반환
   */
  validateFields() {
    return this.through(async () => {
      if (!_validateFields(this.fields, this.req.body))
        this.value = this.res
          .status(400)
          .send({ message: "필요한 패러미터가 누락되었습니다." });
    });
  }

  /**
   * 해당조건의 데이터가 존재하지 않을 경우 - 400 반환
   */
  exist() {
    return this.through(async () => {
      const response = await this.model.findOne({
        where: this.locator,
      });
      if (!response) {
        this.value = this.res
          .status(400)
          .send({ message: "데이터가 존재하지 않습니다." });
      }
    });
  }

  /**
   * 해당조건의 데이터가 존재할 경우 - 400 반환
   */
  unique() {
    return this.through(async () => {
      const response = await this.model.findOne({
        where: this.locator,
      });
      if (response) {
        this.value = this.res
          .status(400)
          .send({ message: "데이터가 이미 존재합니다." });
      }
    });
  }

  put() {
    return this.through(async () => {
      try {
        await this.model.update(this.req.body, {
          where: this.locator,
        });
        this.value = this.res
          .status(200)
          .send({ message: "성공적으로 업데이트 되었습니다." });
      } catch (err) {
        console.log(err);
        this.value = this.res
          .status(400)
          .send({ message: "에러가 발생했습니다." });
      }
      this._end();
    });
  }
}

export default ControlWrapper;
