// "Date","Price","Open","High","Low","Vol.","Change %"

const MAX_INDEXES_AMOUNT = 0;
const MAX_STOCK_PRICE = 0;
const MAX_LOSE_YEAR = 0;
const MAX_LOSE_MONTH = 0;

let movies = [];
let artists = [];
let fs = require('fs');

movies[0] = require("./data/films/1.json");
movies[1] = require("./data/films/2.json");
movies[2] = require("./data/films/3.json");
artists[0] = require("./data/artists/1.json");
artists[1] = require("./data/artists/2.json");
artists[2] = require("./data/artists/3.json");

// console.log(`Movie:`, arr[2]["title"], `- one of the main actors:`, arr2[0]["name"]);
//console.log(JSON.stringify(arr), JSON.stringify(arr2));

fs.writeFile('data.json', JSON.stringify({movies, artists}), (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});

/*const data = new Uint8Array(Buffer.from('Hello Node.js'));
fs.writeFile('message.txt', data, (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});*/
try {
  films = fs.readdirSync("./data/films1");
  artists = fs.readdirSync("./data/artists");
  console.log(films, artists);
} catch (e) {
  console.log("Проблемки-фемки");
}
