var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var env = process.env.NODE_ENV || 'development';
var config = require('./../config')[env];

/* GET home page. */
router.get('/', function(req, res, next) {
  mongoClient.connect(config.database.host, (err, db) => {
    if(err === null){
      db.collection('highscores').find({}, {'sort':[['playerScore','desc']]}).limit(10).toArray((err, scores) => {
        if(err === null){
          res.status(200).render('index', { title: 'Bog Brunch', highscores: scores });
        } else {
          res.status(500);
        }
      });
    }
    db.close();
  });
});

module.exports = router;
