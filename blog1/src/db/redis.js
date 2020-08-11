const redis = require('redis');
const { REDIS_CONF } = require('../config/db');

// 创建客户端
const redisClient = redis.createClient(REDIS_CONF.port,REDIS_CONF.host);

redisClient.on('error',err => {
  console.log(err)
});

function setRedis(key, val) {
  if(typeof val === 'object'){
    val = JSON.stringify(val)
  }
  console.log('set redis '+ key,val)
  redisClient.set(key,val,redis.print)
}

function getRedis(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key,(err,val)=>{
      if(err){
        reject(err);
        return
      }
      if(val == null){
        resolve(null);
        return
      }

      try{
        resolve(JSON.parse(val))
      }catch (e) {
        resolve(val)
      }

      console.log('get redis '+ key,val)

      //退出
      //redisClient.quit()
    })
  })
}

module.exports = {
  getRedis,
  setRedis
};
