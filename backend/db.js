const mongoose = require("mongoose");

const mongoURI = "";

const connnectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connected to Mongo Successfully");
  });
};

module.exports = connnectToMongo;
