// "Date","Price","Open","High","Low","Vol.","Change %"

const MAX_INDEXES_AMOUNT = 0;
const MAX_STOCK_PRICE = 0;
const MAX_LOSE_YEAR = 0;
const MAX_LOSE_MONTH = 0;

let movies = [];
let artists = [];
let fs = require('fs');

try {
  films = fs.readdirSync("./data/films");
  artists = fs.readdirSync("./data/artists");
  console.log(films, artists);
} catch (e) {
  console.log("Проблемки-фемки");
}

for (let filename of films) {
  let allax1 = JSON.parse(fs.readFileSync(`./data/films/${filename}`));
  movies.push(allax1);
}

for (filename of artists) {
  let allax2 = JSON.parse(fs.readFileSync(`./data/artists/${filename}`));
  artists.push(allax2);
}

// console.log(`Movie:`, arr[2]["title"], `- one of the main actors:`, arr2[0]["name"]);
//console.log(JSON.stringify(arr), JSON.stringify(arr2));

fs.writeFile('data.json', JSON.stringify({movies, artists}), (e) => {
  if (e) throw err;
  console.log('The file has been saved!');
});
