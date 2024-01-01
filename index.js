const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require('body-parser'),
  app = express();

//movie array for res.json (task-2.4)
let movies = [
  {
    name: 'The Lord of the Rings: Return of the King',
    director: 'Peter Jackson',
    year: '2003',
    genre: 'Fantasy'
  },
  {
    name: 'The Birdcage',
    director: 'Mike Nichols',
    year: '1996',
    genre: 'Comedy'  
  },
  {
    name: 'Interstellar',
    director: 'Christopher Nolan',
    year: '2014',
    genre: 'Sci-fi'
  },
  {
    name: 'Midsommar',
    director: 'Ari Aster',
    year: '2019',
    genre: 'Horror'
  },
  {
    name: 'Pride and Prejudice',
    director: 'Joe Wright',
    year: '2005',
    genre: 'Romance'
  }
];

let users = [
  {
    username: 'Sam12',
    id:'',
    favList: '',
  },
  {
    username: 'Brock33',
    id:'',
    favList: '',
  },
  {
    username: 'Dorthy45',
    id:'',
    favList: '',
  }
];

//middleware call
app.use(morgan("common"));
app.use(bodyParser);

//Static file route
app.use(express.static("public"));

//endpoint routes
app.get('/movies', (req, res) => {
  res.json(movies);
});
app.get('/movies/:movie', (req, res) => {
  
})

//error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
});

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080");
});
