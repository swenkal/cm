const dbMethods = require('./dbMethods.js');
const TWO_DAYS_IN_MS = 172800000;

module.exports = {
  generateSession,
  getSessionContext,
  deleteUserSession
}
async function generateSession(response, postData){
  let sessionCreateTime = Date.now();
  let sessionЕxpiresTime = sessionCreateTime + TWO_DAYS_IN_MS;
  let cookieLifeTime = new Date(sessionЕxpiresTime).toGMTString();
  let userToken = generateRandomString();

  let sessionData = {};
  sessionData._id = userToken;
  sessionData.login = postData.login;
  sessionData.createTime = sessionCreateTime;
  sessionData.expiresTime = sessionЕxpiresTime;

  await dbMethods.createUserSession(sessionData, postData);

  return response.setHeader("Set-Cookie", `token=${userToken}; path=/api; expires=${cookieLifeTime}`);
}

function generateRandomString(length){
   let lengthString = length || 16;
   let resultString = '';
   let randNum;
   while( lengthString-- ){
     randNum = Math.floor(Math.random() * 62);
     resultString += String.fromCharCode(randNum + (randNum < 10 ? 48 : randNum < 36 ? 55 : 61))
   }
   return resultString;
}

async function getSessionContext(request, response) {
  let userCookie = parseCookie(request.headers.cookie);
  let resultContext = {};
  if(userCookie['token'] == undefined || typeof userCookie['token'] !== 'string') return resultContext;

  try {
    let userSession = await dbMethods.getUserSession(userCookie['token']);
    if(userSession == null) return resultContext;

    if(userSession.expiresTime < Date.now()){
      await dbMethods.deleteUserSession(userSession);
      console.log(`Session ${userSession._id} for user ${userSession.login} was deleted!`);
      return resultContext;
    }
    await updateUserSession(response, userSession);

    resultContext.username = userSession.login;
    return resultContext;
  } catch (e) {
    console.log(`Errors in sessions -> getSessionContext...`);
    throw e;
  }

}

function parseCookie(cookieString){
  let resultCookie = {}
  if (!cookieString || typeof cookieString !== 'string' ) return resultCookie;
  for(cookies of cookieString.split(';')) {
      let [key, value] = cookies.trim().split('=');
      resultCookie[key] = value;
  }
  return resultCookie;
}

async function updateUserSession(response, userSession){
  userSession.expiresTime = Date.now() + TWO_DAYS_IN_MS;
  let newCookieLifeTime = new Date(userSession.expiresTime).toGMTString();
  try {
    await dbMethods.updateSessionExpiresTime(userSession);
    console.log(`Session ${userSession._id} for user ${userSession.login} was updated!`);
    response.setHeader("Set-Cookie", `token=${userSession._id}; path=/api; expires=${newCookieLifeTime}`);
    return true;
  } catch(e) {
    console.log(`Errors in sessions -> updateUserSession...`);
    throw e;
  }
}

async function deleteUserSession(request, response){
  try {
    let userCookie = parseCookie(request.headers.cookie);
    let expiresTime = new Date(0).toGMTString();
    await dbMethods.deleteUserSession(userCookie['token']);
    console.log(`Session ${userCookie['token']} was deleted!`);
    response.setHeader("Set-Cookie", `token=''; expires=${expiresTime}`);
    return true;
  } catch(e) {
    console.log(`Errors in sessions -> deleteUserSession...`);
    throw e;
  }
}
