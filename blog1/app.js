const querystring = require('querystring');
const handleBlogRouter = require('./src/router/blog');
const handleLoginRouter = require('./src/router/user');
const { getRedis, setRedis } = require('./src/db/redis');
const { access } = require('./src/utils/log');

const serverHandle = (req, res) => {
  // 记录 access log
  access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`);

  //获取 path
  const url  = req.url;
  req.path = url.split('?')[0];

  //解析query
  req.query = querystring.parse(url.split('?')[1]);

  //设置返回格式 JSON
  res.setHeader('Content-type', 'application/json');

  // 处理cookie
  handleCookie(req);

  //处理 session - 使用redis
  let needSetCookie = false;
  let userId = req.cookie.userid;
  if(!userId){
    needSetCookie = true;
    userId = `${Date.now()}_${Math.random()}`;

    setRedis(userId, {})
  }
  // 获取session
  req.sessionId = userId;
  getRedis(req.sessionId).then(sessionData=>{
    if(sessionData === null){
      // 初始化 redis 中的 session 值
      setRedis(req.sessionId, {});
      // 设置 req 中的 session
      req.session = {}
    } else {
      //设置 session
      req.session = sessionData
    }

    console.log('req.session:' + JSON.stringify(req.session));
    return getPostData(req)

  }).then(postData =>{
    // get请求处理
    req.body = JSON.parse(postData);

    //处理 blog 路由
    const blogResult = handleBlogRouter(req, res);

    if(blogResult){
      blogResult.then(blogData=>{
        if(needSetCookie){
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }

        res.end(
          JSON.stringify(blogData)
        )
      });
      return
    }

    //处理 user 路由
    const userResult = handleLoginRouter(req, res);
    if(userResult){
      userResult.then(userData=>{
        if(needSetCookie){
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }

        res.end(
          JSON.stringify(userData)
        )
      });
      return
    }

    res.writeHead(404, {'Content-type': 'text/plain'});
    res.write('404 NOT FOUND\n');
    res.end()
  })
};

//处理post data中的异步
const getPostData = (req) => {
  return new Promise(resolve => {
    if(req.method !== 'POST'){
      resolve('{}');
      return
    }
    if(req.headers['content-type'] !== 'application/json'){
      resolve({});
      return
    }
    let postData = '';
    req.on('data', chunk => {
      postData += chunk.toString()
    });
    req.on('end',() => {
      if(!postData){
        resolve({});
        return
      }

      resolve(postData)
    })
  })
};


// 解析cookie
const handleCookie = (req) => {
  req.cookie = {};
  const cookieStr = req.headers.cookie || '';
  cookieStr&&cookieStr.split(';').forEach(item => {
    const [ key, val ] = item.split('=');
    req.cookie[key] = val
  })
};

// 获取 cookie 过期时间
const getCookieExpires = () => {
  const d = new Date();
  d.setTime(d.getTime() + ( 24 * 60 * 60 * 1000 ));
  return d.toGMTString()
};

module.exports = serverHandle;
