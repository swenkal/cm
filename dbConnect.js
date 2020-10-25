const mongodb = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/cm';
let db = null;

module.exports = {
  initDB,
  getDB(){
    return db;
  }
}

function initDB(callback) {
  return mongodb.connect(MONGO_URL, (err, connection) => {
    if(err){
      console.error('Error with connection to DB');
      callback(err);
      return;
    }

    console.info('Connection to DB successfully');
    db = connection;
    callback(null);
  })
}
