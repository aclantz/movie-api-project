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

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.connect("mongodb://127.0.0.1/cfDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// mongoose.connect("mongodb+srv://alexclantz:lan9tern56@lantzdevdb.pv1bqez.mongodb.net/myFlixDB?retryWrites=true&w=majority", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

/**
 * Middleware functions, managing JSON, URL encoding, and CORS 
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); //cross-Origin Resource Sharing
let auth = require("./auth")(app);

/**
 * Welcome page endpoint
 * GET 
 * @returns welcome page
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my movie app!');
});

/**
 * All movies endpoint
 * GET
 * @async
 * @returns {JSON} list of all movies
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
 * GET
 * @async
 * @param {string} movie.title
 * @returns {JSON} one movie
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
 * GET
 * @async
 * @param {string} genre.Name
 * @returns {JSON} specific genre
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
 * GET
 * @async
 * @param {string} director.name
 * @returns {JSON} specific director
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
 * POST
 * @async
 * @param {string} username
 * @param {string} password
 * @param {string} email
 * @param {string} birthday
 * @returns {JSON} new user object
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
 * PUT
 * extra Auth
 * @async
 * @param {string} username 
 * @param {string} password
 * @param {string} email 
 * @param {string} birthday
 * @returns {JSON} updated user object
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
 * PUT
 * @async
 * @param {string} movie._id
 * @returns {JSON} updated user object 
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
 * Remove from favoriteMovie array endpoint
 * DELETE
 * @async
 * @param {string} movie._id
 * @returns {JSON} updated user object
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
 * DELETE
 * @async
 * @param {string} username
 * @returns {string} username + message
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
 * @async
 * @returns {JSON} list of users
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
