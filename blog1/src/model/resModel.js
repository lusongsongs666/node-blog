class BaseModel {
  constructor(data, message){
    if(typeof data === 'string'){
      this.resultData = data;
      data = null;
      message = null;
    }

    if(data){
      this.resultData = data
    }

    if(message){
      this.resultMsg = message
    }
  }
}

class SuccessModel extends BaseModel{
  constructor(data, message) {
    super(data, message);
    this.resultCode = 'WL-0000';
    this.errno = 0
  }
}

class ErrorModel extends BaseModel{
  constructor(data, message) {
    super(data, message);
    this.resultCode = 'WL-0004';
    this.errno = -1
  }
}

module.exports = {
  SuccessModel,
  ErrorModel
};
