const express = require("express"),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  app = express();

//bonus task 2.5
let movies = [
  {
    Title: 'The Lord of the Rings: Return of the King',
    Director: {
      Name: 'Peter Jackson',
      Birthday: '10/31/1961'
    },
    Year: '2003',
    Genre: {
      Name: 'Fantasy',
      Description: 'A category of film or TV that shows fictional fantastical stories'
    }
  },
  {
    Title: 'The Birdcage',
    Director: {
      Name: 'Mike Nichols',
      Birthday: ''
    },
    Year: '1996',
    Genre: {
      Name: 'Comedy',
      Description: 'A category of Film or TV that is focused on humor'
    }  
  },
  {
    Title: 'Interstellar',
    Director: {
      Name: 'Christopher Nolan',
      Birthday: ''
    },
    Year: '2014',
    Genre: {
      Name: 'Scifi',
      Description: 'A category of Film or TV set and tells futuristic fictional stories'
    }
  },
  {
    Title: 'Midsommar',
    Director: {
      Name: 'Ari Aster',
      Birthday: ''
    },
    Year: '2019',
    Genre: {
      Name: 'Horror',
      Description: 'A category of Film or TV that tries to scare you'
    }
  },
  {
    Title: 'Pride and Prejudice',
    Director: {
      Name: 'Joe',
      Birthday: ''
    },
    Year: '2005',
    Genre: {
      Name: 'Romance',
      Description: 'A category of Film or TV that tells stories about relationships'
    }
  }
];
//bonus task 2.5
let users = [
  {
    name: 'Sam',
    id:'1',
    favoriteMovies: ['The Birdcage', 'Midsommar'],
  },
  {
    name: 'Joe',
    id:'2',
    favoriteMovies: ['Interstellar'],
  },
  {
    name: 'Dan',
    id:'3',
    favoriteMovies: [],
  }
];

//middleware call
app.use(bodyParser.json());

//READ, return movies array
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//READ, return data about specific movie ** not returning correct movie
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title);

  if(movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no movie found');
  }
});

//READ, return data about genres 
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName).Genre ;

  if(genre) {
    return res.status(200).json(genre);
  }else {
    res.status(400).send('no such genre')
  }
})

//READ, return data about director **
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName).Director ;

  if(director) {
    return res.status(200).json(director);
  }else {
    res.status(400).send('no such director')
  }
})

//CREATE, register a new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(401).send('Users need names');
  }
});

//UPDATE, change user name
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user.');
  }
});


//UPDATE, add movie to user favoriteMovies array 
app.put('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send('Movie has been added to favoriteMovies list for user');
  } else {
    res.status(400).send('no such user');
  }
});


//DELETE, remove movie from user favoriteMovies array
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send('$(movieTitle) has been removed to favoriteMovies list for user $(id)');
  } else {
    res.status(400).send('no such user');
  }
});

//DELETE, deregister a user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id); 

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send('User email has been deleted');
  } else {
    res.status(400).send('no such user');
  }
});

//error handler
// app.use((err, req, res, next) => {
//   console.log(err.stack);
// });

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080");
});
