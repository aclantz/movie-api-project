const express = require("express"),
  morgan = require("morgan"),
  app = express(),
  morgan = morgan();

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

//create log
const accessLogStream = fs.createLogStream(path.join(__dirname, "log.txt"));

//calling middleware functions
app.use(morgan("combined", { stream: "accessLogStream" }));
app.use((err, req, res, next) => {
  console.log(err.stack);
});

//GET routes
app.get("/movies", (req, res) => {
  res.json(topMovies);
});
app.get("/", (req, res) => {
  res.send("I love watching movies!");
});

//Static file route
app.use(express.static("public"));
