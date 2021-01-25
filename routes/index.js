var express = require("express");
var router = express.Router();
var mongoClient = require("mongodb").MongoClient;
var env = process.env.NODE_ENV || "development";
var config = require("./../config")[env];
// Google Firebase.
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

firebase.initializeApp({
  apiKey: "AIzaSyCTXTHLJhyVfiPLDBspcQ5RCt3dDmgrqyI",
  authDomain: "bog-brunch.firebaseapp.com",
  projectId: "bog-brunch",
  storageBucket: "bog-brunch.appspot.com",
  messagingSenderId: "585487410155",
  appId: "1:585487410155:web:0520ffb84488140509afae",
});

/* GET home page. */
router.get("/", function (req, res, next) {
  if (env === "development") {
    mongoClient.connect(config.database.host, (err, db) => {
      if (err === null) {
        db.collection("highscores")
          .find({}, { sort: [["playerScore", "desc"]] })
          .limit(10)
          .toArray((err, scores) => {
            if (err === null) {
              res
                .status(200)
                .render("index", { title: "Bog Brunch", highscores: scores });
            } else {
              res.status(500);
            }
          });
      }
      db.close();
    });
  } else if (env === "production") {
    // Firebase
    var db = firebase.firestore();
    db.collection("highscores")
      .orderBy("playerScore", "desc")
      .limit(10)
      .get()
      .then((snapshot) => {
        res.status(200).render("index", {
          title: "Bog Brunch",
          highscores: snapshot.map((doc) => doc.data()),
        });
      });
  }
});

module.exports = router;
