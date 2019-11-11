// "Date","Price","Open","High","Low","Vol.","Change %"

const MAX_INDEXES_AMOUNT = 0;
const MAX_STOCK_PRICE = 0;
const MAX_LOSE_YEAR = 0;
const MAX_LOSE_MONTH = 0;

let i = 0;
let i2 = 0;
let movies = [];
let artists = [];
let fs = require('fs');

movies[0] = require("./data/films/1.json")
movies[1] = require("./data/films/2.json")
movies[2] = require("./data/films/3.json")
artists[0] = require("./data/artists/1.json")
artists[1] = require("./data/artists/2.json")
artists[2] = require("./data/artists/3.json")
// console.log(`Movie:`, arr[2]["title"], `- one of the main actors:`, arr2[0]["name"]);
//console.log(JSON.stringify(arr), JSON.stringify(arr2));

fs.writeFile('data.json', JSON.stringify({movies, artists}), (e) => {
  if (e) throw err;
  console.log('The file has been saved!');
});

try {
  films = fs.readdirSync("./data/films");
  artists = fs.readdirSync("./data/artists");
  console.log(films, artists);
} catch (e) {
  console.log("Проблемки-фемки");
}

for (let files of films) {
  movies[i] = require(`./data/films/${files}`)
  i ++;
}

for (let files2 of artists) {
  artists[i2] = require(`./data/artists/${files2}`)
  i2 ++;
}
