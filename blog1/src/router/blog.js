const { SuccessModel, ErrorModel } = require('../model/resModel');
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
}  = require('../controller/blog');

const loginCheck = (req) => {
  if(!req.session.username){
    return Promise.resolve(new ErrorModel('未登录'))
  }
};

const handleBlogRouter = (req, res) => {
  const method = req.method,path = req.path;

  // 获取博客列表
  if(method === 'GET' && req.path === '/api/blog/list'){
    let author = req.query.author || '';
    const keyword = req.query.keyword || '';

    if(req.query.isadmin){
      const loginCheckResult = loginCheck(req);
      if(loginCheckResult){
        return loginCheckResult
      }
      author = req.session.username
    }

    const listData = getList(author, keyword);

    return listData.then(res=>{
      return new SuccessModel(res)
    },err=>{
      return new ErrorModel(err)
    })
  }

  // 获取博客详情
  if(method === 'GET' && path === '/api/blog/detail'){
    const id = req.query.id;
    const detailData = getDetail(id);

    return detailData.then(res=>{
      return new SuccessModel(res)
    },err=>{
      return new ErrorModel(err)
    })
  }

  // 新建一篇博客
  if(method === 'POST' && path === '/api/blog/new'){
    const loginCheckResult = loginCheck(req);
    if(loginCheckResult){
      return loginCheckResult
    }

    req.body.author = req.session.username;

    const blogData = newBlog(req.body);

    return blogData.then(res=>{
      return new SuccessModel(res)
    },err=>{
      return new ErrorModel(err)
    })
  }

  // 更新一篇博客
  if(method === 'POST' && req.path === '/api/blog/update'){
    const loginCheckResult = loginCheck(req);
    if(loginCheckResult){
      return loginCheckResult
    }

    const id = req.query.id;

    //req.body.author = "luss22";

    const result = updateBlog(id, req.body); //true false

    return result.then(val=>{
      if(val){
        return new SuccessModel()
      }else {
        return new ErrorModel('更新博客失败')
      }
    })
  }

  // 删除一篇博客
  if(method === 'POST' && req.path === '/api/blog/delete'){
    const loginCheckResult = loginCheck(req);
    if(loginCheckResult){
      return loginCheckResult
    }

    req.body.author = req.session.username;
    const id = req.query.id;
    const result = deleteBlog(id,req.body.author); //true false

    return result.then(val=>{
      if(val){
        return new SuccessModel()
      }else {
        return new ErrorModel('删除博客失败')
      }
    })
  }
};

module.exports = handleBlogRouter;
