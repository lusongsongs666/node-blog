const { exec } = require('../db/mysql');

const getList = (author,keyword) => {
  let sql = `select * from blogs where 1=1`; //1=1 为了防止author keyword都不存在
  if(author){
    sql += ` and author='${author}'`
  }
  if(keyword){
    sql += ` and title like '%${keyword}%'`
  }
  sql += ` order by createtime desc;`;

  return exec(sql)
};

const getDetail = (id) => {
  let sql = `select * from blogs where id='${id}'`;
  return exec(sql).then(detailData=>{
    return detailData[0] || {}
  })
};

const newBlog = (blogData={}) => {
  let { title,content,author,createTime=Date.now() } = blogData;
  const sql = `
      insert into blogs (title, content, createTime, author)
      values ('${title}', '${content}', '${createTime}', '${author}')      
  `;
  return exec(sql).then(insertData=>{
    console.log('insertData: ' + JSON.stringify(insertData));
    // {"fieldCount":0,"affectedRows":1,"insertId":26,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
    return {
      id: insertData.insertId
    }
  })
};

const updateBlog = (id, blogData={}) => {
  let { title,content } = blogData;
  const sql = `
      update blogs set title='${title}', content='${content}' where id=${id};
  `;

  return exec(sql).then(updateData=>{
    console.log('updateData: ' + JSON.stringify(updateData));

    if(updateData.affectedRows > 0) {
      return true
    }
    return false
  },err=>{
    console.log(err)
  })
};

const deleteBlog = (id, author) => {
  const sql = `
      delete from blogs where id='${id}' and author='${author}'
  `;
  return exec(sql).then(deleteData=>{
    console.log(deleteData)
    if(deleteData.affectedRows > 0) {
      return true
    }
    return false
  })
};

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
};
