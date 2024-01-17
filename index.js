const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  Models = require("./models");

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

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extend: true }));
app.use(cors()); //cross-Origin Resource Sharing
let auth = require("./auth")(app);

//READ, welcome page
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my movie app!');
})

//READ, return movies array,
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

//READ, return data about specific movie
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

//READ, return data about genres
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

//READ, return data about director
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

//CREATE, register a new user, no auth. New validation added
app.post(
  "/users",
  [
    check("username", "Username is required.").isLength({ min: 5 }),
    check(
      "username",
      "Username conatins non alphanumeric characters - not allowed."
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

//UPDATE, change user name, extra auth.
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    //condition to check if username matches
    if (req.username !== req.params.username) {
      return res.status(400).send("Permission denied.");
    }
    //continuing to function
    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
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

//UPDATE, add movie to user favoriteMovies array
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

//DELETE, remove movie from user favoriteMovies array
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

//DELETE, deregister a user,
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

//listen for requests, updated*
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
