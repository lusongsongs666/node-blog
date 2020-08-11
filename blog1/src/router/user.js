const { SuccessModel, ErrorModel } = require('../model/resModel');
const { login } = require('../controller/user');
const { setRedis } = require('../../src/db/redis');

// 获取 cookie 过期时间
const getCookieExpires = () => {
  const d = new Date();
  d.setTime(d.getTime() + ( 24 * 60 * 60 * 1000 ));
  return d.toGMTString()
};

const handleLoginRouter = (req, res) => {
  const method = req.method;

  // 登录
  if(method === 'POST' && req.path === '/api/user/login'){
    const { username, password } = req.body;
    //const { username, password } = req.query;

    const result = login(username, password);

    return result.then(data=>{
      if(data.username){
        //设置 session
        req.session.username = data.username;
        req.session.realname = data.realname;

        //同步到redis
        setRedis(req.sessionId, req.session);

        return new SuccessModel()
      }
      return new ErrorModel('登录失败')
    })
  }
};

module.exports = handleLoginRouter;



