const mongoose = require("mongoose"),
bcrypt = require('bcrypt');

/**
 * Movie Schema
 * @summary define a schema for movie data
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
  },
  ImagePath: String,
  Actors: [String],
  Featured: Boolean,
});

/**
 * User Schema
 * @summary define a schema for user data
 */
let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favoritemovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

/**
 * Hashing password function
 * @param {string} password 
 * @returns encrypted password
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
}
/**
 * Validates password by comparing to encrypted password
 * @param {string} password 
 * @returns validation
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
