const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  mongoose = require("mongoose"),
  Models = require("./models");

const app = express(),
  Movies = Models.Movie,
  Users = Models.User;

mongoose.connect("mongodb://127.0.0.1/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//middleware 
app.use(bodyParser.json());

//READ, return movies array, updated*
app.get("/movies", async (req, res) => {
  await Movies.find()
    .then((moviesList) => {
      res.status(201).json(moviesList);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error:" + err);
    });
});

//READ, return data about specific movie, updated*
app.get("/movies/:title", async (req, res) => {
  await Movies.find({ Title: req.params.title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error:" + err);
    });
});

//READ, return data about genres ***
app.get("/movies/genre/:genreName", async (req, res) => {
  await Movies.find({ "Genre.Name": req.params.genreName })
    .then((genre) => {
      res.status(200).json(genre);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error:" + err);
    });
});

//READ, return data about director ***
app.get("/movies/director/:directorName", async (req, res) => {
  await Movies.find({ "Director.Name": req.params.directorName })
    .then((director) => {
      res.status(200).json(director);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error:" + err);
    });
});

//CREATE, register a new user, updated*
app.post("/users", async (req, res) => {
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + "already exists");
      } else {
        Users.create({
          username: req.body.username,
          password: req.body.password,
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
});

//UPDATE, change user name, updated*
app.put("/users/:username", async (req, res) => {
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
});

//UPDATE, add movie to user favoriteMovies array, updated*
app.put("/users/:username/movies/:movieID", async (req, res) => {
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
});

//DELETE, remove movie from user favoriteMovies array, updated*
app.delete("/users/:username/movies/:movieID", async (req, res) => {
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
});

//DELETE, deregister a user, updated*
app.delete("/users/:username", async (req, res) => {
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
});


//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080");
});
