// "Date","Price","Open","High","Low","Vol.","Change %"

const MAX_INDEXES_AMOUNT = 0;
const MAX_STOCK_PRICE = 0;
const MAX_LOSE_YEAR = 0;
const MAX_LOSE_MONTH = 0;

let fs = require('fs');

let films_names;
let artists_names;

try {
  films_names = fs.readdirSync("./data/films");
  artists_names = fs.readdirSync("./data/artists");
  console.log(films, artists);
} catch (e) {
  console.log("Проблемки-фемки");
}

let films = [];
let artists = [];

for (let filename of films_names) {
  let film = JSON.parse(fs.readFileSync(`./data/films/${filename}`));
  films.push(film);
}

for (filename of artists_names) {
  let artist = JSON.parse(fs.readFileSync(`./data/artists/${filename}`));
  artists.push(artist);
}

fs.writeFile('data.json', JSON.stringify({movies, artists}), (e) => {
  if (e) throw err;
  console.log('The file has been saved!');
});
