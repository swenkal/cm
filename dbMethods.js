const getDB = require('./dbConnect.js').getDB;


module.exports = {
  getUserInfo,
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
  createUserSession,
  getUserSession,
  deleteUserSession,
  deleteAllSessionsForUser,
  updateSessionExpiresTime
}

async function getUserInfo(login){
  try {
    let userInfo = await getDB().collection('accounts').findOne(
      { login : login }
    );
    return userInfo;
  } catch(err){
    console.log(`Error in dbMethods -> getUserInfo`);
    throw err;
  }
};

async function createUserAccount(userInfo){
  try{
    await getDB().collection('accounts').insertOne(userInfo);
    return true;
  } catch(err) {
    console.log(`Error in dbMethods -> createUserAccount`);
    throw err;
  }
};

async function updateUserAccount(userInfo){
  try{
    await getDB().collection('accounts').updateOne(
      { login : userInfo.login },
      { $set : userInfo } );
    return true;
  } catch(err) {
    console.log(`Error in dbMethods -> updateUserAccount`);
    throw err;
  }
};

async function deleteUserAccount(login){
  try{
    await getDB().collection('accounts').deleteOne( {login : login} );
    return true;
  } catch(e) {
    console.log(`Error in dbMethods -> deleteUserAccount`);
    throw err;
  }
}

async function createUserSession(sessionData, postData){
  if( !('login' in postData) ) throw new Error('Uncorrect postData.');

  return await getDB().collection('sessions').insertOne(sessionData);
};

async function getUserSession(userToken){
  return await getDB().collection('sessions').findOne( {_id : userToken} );
}

async function deleteUserSession(userSession){
  if( !('_id' in userSession) ) throw new Error('User session not consist "id"');

  try {
    await getDB().collection('sessions').deleteOne( {_id : userSession._id} );
    return true;
  } catch (e) {
    console.log(`Error with deleting user session : ${userSession.login}, token: ${userSession._id}`);
    throw e;
  }

};

async function deleteAllSessionsForUser(login){
  try {
    await getDB().collection('sessions').deleteMany( { login : login } );
    return true;
  } catch(e) {
    console.log(`Errors in dbMethods -> deleteAllSessionsForUser...`);
    throw e;
  }
}

async function updateSessionExpiresTime(userSession){
  try {
    await getDB().collection('sessions').updateOne(
      {_id : userSession._id},
      { $set : { expiresTime : userSession.expiresTime }}
    );
    return true;
  } catch (e) {
    console.log(`Can't update session ${userSession._id} for user ${userSession.login}`);
    throw e;
  }

}
