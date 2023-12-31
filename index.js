const express = require("express"),
  morgan = require("morgan"),
  app = express();

//movie array for res.json (task-2.4) 
let topMovies = [
  {
    title: "The Lord of the Rings",
    Director: "Peter Jackson",
  },
  {
    title: "The Birdcage",
    Director: "Mike Nichols",
  },
  {
    title: "The Shawshank Redemption",
    director: "Frank Darabont",
  },
  {
    title: "Rogue One",
    director: "Gareth Edwards",
  },
  {
    title: "The Goonies",
    director: "Richard Donner",
  },
  {
    title: "The Devil Wears Prada",
    director: "David Frankel",
  },
  {
    title: "Interstellar",
    director: "Christoper Nolan",
  },
  {
    title: "Sunset Boulevard",
    director: "Billy Wilder",
  },
  {
    title: "Its a Wonderful Life",
    director: "Frank Capra",
  },
  {
    title: "Princess Mononoke",
    director: "Hayao Miyazaki",
  },
];

//request log
app.use(morgan, ('common'));

//Static file route
app.use(express.static("public"));

//GET routes
app.get("/movies", (req, res) => {
  res.json(topMovies);
});
app.get("/", (req, res) => {
  res.send("I love watching movies!");
});

//error handler
app.use((err, req, res, next) => {
    console.log(err.stack);
  });

//listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});