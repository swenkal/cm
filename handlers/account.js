const dbMethods = require('../dbMethods.js');

module.exports = {
  urlPatern : /^\/api\/account$/,
  handler : async function(request, response, postData, sessionContext){
    let resultUserAccount = {};
    if(!('username' in sessionContext)){
      resultUserAccount.message = 'You must log in. Follow to /api/auth';
      return sendResponseObj(403, resultUserAccount, response);
    }
    //collect all processors for supported HTTP verbs
    const verbsREST = {
      'GET' : getAccount,
      'POST' : createAccount,
      'PUT' : updateAccount,
      'DELETE' : deleteAccount
    }
    if(verbsREST[request.method] == undefined){
      resultUserAccount.message = 'Bad request method, try again';
      return sendResponseObj(400, resultUserAccount, response);
    }

    const processor = verbsREST[request.method];

    return await processor(response, postData, sessionContext);

  }
}

function isEmptyObject(someObj){
  for(let key in someObj){
    return false;
  }
  return true;
}

function sendResponseObj(statusCode, resultObj, response){
  response.setHeader('Content-Type', 'application/json');
  response.statusCode = statusCode;
  response.end(JSON.stringify(resultObj));
  return true;
}

async function getAccount(response, postData, sessionContext){
  try {
    let userInfo = await dbMethods.getUserInfo(sessionContext.username);
    if(userInfo.role !== 'admin' || isEmptyObject(postData) || postData.login == undefined) {
      return sendResponseObj(200, userInfo, response);
    }

    let accountInfo = await dbMethods.getUserInfo(postData.login);
    if(accountInfo == null){
      let errorResult = { message : 'Bad request, account not found.' };
      return sendResponseObj(400, errorResult, response);
    }
    return sendResponseObj(200, accountInfo, response);
  } catch(e) {
    console.log(`Error in account.js -> getAccount: ${e}\n`);
    let errorResult = { message : 'Server error. Try again...' };
    return sendResponseObj(500, errorResult, response);
  }
}

async function createAccount(response, postData, sessionContext){
  let resultCreateUser = { created : false };
  try {
    let userInfo = await dbMethods.getUserInfo(sessionContext.username);
    if(userInfo.role !== 'admin') {
      resultCreateUser.message = 'Your role is not admin!';
      return sendResponseObj(403, resultCreateUser, response);
    }

    if(isEmptyObject(postData) || postData.login == undefined
      || postData.password == undefined || postData.role == undefined) {
      resultCreateUser.message = 'Bad POST data!';
      return sendResponseObj(400, resultCreateUser, response);
    }

    let accountInfo = await dbMethods.getUserInfo(postData.login);
    if(accountInfo){
      resultCreateUser.message = 'User with current login existed!';
      return sendResponseObj(400, resultCreateUser, response);
    }
    resultCreateUser.created = await dbMethods.createUserAccount(postData);
    return sendResponseObj(200, resultCreateUser, response);
  } catch(e) {
    console.log(`Error in account.js -> createAccount: ${e}\n`);
    resultCreateUser.message = 'Server error. Try again...';
    return sendResponseObj(500, resultCreateUser, response);
  }
}

async function updateAccount(response, postData, sessionContext){
  let resultUpdateUser = { updated : false };
  try {
    let userInfo = await dbMethods.getUserInfo(sessionContext.username);
    if(userInfo.role !== 'admin') {
      resultUpdateUser.message = 'Your role is not admin!';
      return sendResponseObj(403, resultUpdateUser, response);
    }

    if(isEmptyObject(postData) || postData.login == undefined) {
      resultUpdateUser.message = 'Bad PUT data!';
      return sendResponseObj(400, resultUpdateUser, response);
    }

    if(Object.keys(postData).length <= 1){
      resultUpdateUser.message = 'No data for update!';
      return sendResponseObj(400, resultUpdateUser, response);
    }

    resultUpdateUser.updated = await dbMethods.updateUserAccount(postData);
    return sendResponseObj(200, resultUpdateUser, response);
  } catch(e) {
    console.log(`Error in account.js -> updateAccount: ${e}\n`);
    resultUpdateUser.message = 'Server error. Try again...';
    return sendResponseObj(500, resultUpdateUser, response);
  }
}

async function deleteAccount(response, postData, sessionContext){
  let resultDeleteUser = { deleted : false };
  try {
    let userInfo = await dbMethods.getUserInfo(sessionContext.username);
    if(userInfo.role !== 'admin') {
      resultDeleteUser.message = 'Your role is not admin!';
      return sendResponseObj(403, resultDeleteUser, response);
    }

    if(isEmptyObject(postData) || postData.login == undefined) {
      resultDeleteUser.message = 'Bad DELETE data!';
      return sendResponseObj(400, resultDeleteUser, response);
    }

    if(userInfo.login == postData.login){
      resultDeleteUser.message = 'You not allow to delete yourself!';
      return sendResponseObj(400, resultDeleteUser, response)
    }

    await dbMethods.deleteUserAccount(postData.login);
    resultDeleteUser.deleted = await dbMethods.deleteAllSessionsForUser(postData.login);
    return sendResponseObj(200, resultDeleteUser, response);
  } catch(e) {
    console.log(`Error in account.js -> deleteAccount: ${e}\n`);
    resultDeleteUser.message = 'Server error. Try again...';
    return sendResponseObj(500, resultDeleteUser, response);
  }
}
