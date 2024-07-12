const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  Models = require("./models");
  // const dotenv = require("dotenv");

  // dotenv.config();
const app = express(),
  Movies = Models.Movie,
  Users = Models.User;

const passport = require("passport");
require("./passport");

const { check, validationResult } = require("express-validator");

/**
 * Mongoose, connection to Heroku server
 */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.connect("mongodb://127.0.0.1/cfDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// mongoose.connect("mongodb+srv://alexclantz:<password>@lantzdevdb.pv1bqez.mongodb.net/myFlixDB?retryWrites=true&w=majority", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

/**
 * Middleware functions:
 * managing JSON 
 * URL encoding 
 * CORS 
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); //cross-Origin Resource Sharing

let auth = require("./auth")(app);

/**
 * Welcome page endpoint
 * GET /
 * @summary Returns the welcome page.
 * @returns {string} 200 - Welcome message
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my movie app!');
});

/**
 * All movies endpoint
 * GET /movies
 * @summary Retrieves a list of all movies.
 * @async
 * @security jwt
 * @returns {Array.<Movie>} 200 - List of movies
 * @returns {Error}  500 - Unexpected error
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((moviesList) => {
        res.status(201).json(moviesList);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Specific movie endpoint
 * GET /movies/{title}
 * @summary Retrieves details of a specific movie.
 * @async
 * @security jwt
 * @param {string} title.path.required - The title of the movie
 * @returns {Movie} 200 - Movie details
 * @returns {Error}  404 - Movie not found
 * @returns {Error}  500 - Unexpected error
 */
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find({ Title: req.params.title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Genre endpoint
 * GET /movies/genre/{genreName}
 * @summary Retrieves details of a specific genre.
 * @async
 * @security jwt
 * @param {string} genreName.path.required - The name of the genre
 * @returns {Genre} 200 - Genre details
 * @returns {Error}  404 - Genre not found
 * @returns {Error}  500 - Unexpected error
 */
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.genreName })
      .then((movie) => {
        res.status(200).json(movie.Genre);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Director endpoint
 * GET /movies/director/{directorName}
 * @summary Retrieves details of a specific director.
 * @async
 * @security jwt
 * @param {string} directorName.path.required - The name of the director
 * @returns {Director} 200 - Director details
 * @returns {Error}  404 - Director not found
 * @returns {Error}  500 - Unexpected error
 */
app.get(
  "/movies/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movie) => {
        res.status(200).json(movie.Director);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Create a new User endpoint
 * POST /users
 * @summary Creates a new user.
 * @async
 * @param {string} username.body.required - The username of the new user
 * @param {string} password.body.required - The password of the new user
 * @param {string} email.body.required - The email of the new user
 * @param {string} birthday.body - The birthday of the new user
 * @returns {User} 201 - New user created
 * @returns {Error}  400 - Username already exists
 * @returns {Error}  422 - Validation error
 * @returns {Error}  500 - Unexpected error
 */
app.post(
  "/users",
  [
    check("username", "Username is required.").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required.").not().isEmpty(),
    check("email", "Email does not appear to be valid.").isEmail(),
  ],
  async (req, res) => {
    //check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password); // added to hash password
    await Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + "already exists");
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send("Error:" + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error:" + error);
      });
  }
);

/**
 * Edit user endpoint
 * PUT /users/{username}
 * @summary Updates a user's information.
 * @async
 * @security jwt
 * @param {string} username.path.required - The username of the user
 * @param {string} username.body - The new username
 * @param {string} password.body - The new password
 * @param {string} email.body - The new email
 * @param {string} birthday.body - The new birthday
 * @returns {User} 200 - Updated user
 * @returns {Error}  400 - Permission denied
 * @returns {Error}  500 - Unexpected error
 */
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    //condition to check if username matches
    if (req.user.username !== req.params.username) { // added .user in req.user.username to make endpoint work?
      return res.status(400).send("Permission denied.");
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    //continuing to function
    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Add to favoriteMovies array endpoint
 * PUT /users/{username}/movies/{movieID}
 * @summary Adds a movie to a user's list of favorite movies.
 * @async
 * @security jwt
 * @param {string} username.path.required - The username of the user
 * @param {string} movieID.path.required - The ID of the movie
 * @returns {User} 200 - Updated user with new favorite movie
 * @returns {Error}  400 - Unexpected error
 * @returns {Error}  500 - Unexpected error
 */
app.put(
  "/users/:username/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { favoritemovies: req.params.movieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send("Error:" + err);
      });
  }
);


/**
 * Remove from favoriteMovies array endpoint
 * DELETE /users/{username}/movies/{movieID}
 * @summary Removes a movie from a user's list of favorite movies.
 * @async
 * @security jwt
 * @param {string} username.path.required - The username of the user
 * @param {string} movieID.path.required - The ID of the movie
 * @returns {User} 200 - Updated user favorite movie list
 * @returns {Error}  400 - Unexpected error
 * @returns {Error}  500 - Unexpected error
 */
app.delete(
  "/users/:username/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: { favoritemovies: req.params.movieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send("Error:" + err);
      });
  }
);

/**
 * Unregister a User endpoint
 * DELETE users/{userName}
 * @summary Delete a user profile form the database
 * @async
 * @security jwt
 * @param {string} username
 * @returns {string} 200 - {username} deleted
 * @returns {string} 400 - {username} not found
 * @returns {string} 400 - unexpected error
 */
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + "was not found");
        } else res.status(200).send(req.params.username + " was deleted");
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send("Error:" + err);
      });
  }
);

/**
 * Array of all users endpoint
 * GET
 * @summary retrieve a list of all users in database
 * @async
 * @security jwt
 * @returns {JSON} 201 - list of users
 * @returns {string} 500 - unexpected error
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((usersList) => {
        res.status(201).json(usersList);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Listen for requests
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
