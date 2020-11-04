const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'cm';
let db;

module.exports = {
  initDB,
  getDB() {
    return db;
  }
}

async function initDB() {
  const client = new MongoClient(mongoURL);

  try {
    await client.connect();
    db = client.db(dbName);

    const dbMethods = require('./dbMethods.js');
    let result = await dbMethods.getUserInfo('swenkal');
    console.log(JSON.stringify(result));

  } catch(err) {
    throw err;
  }
}
