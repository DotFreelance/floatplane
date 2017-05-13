var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var env = process.env.NODE_ENV || 'development';
var config = require('./../config')[env];

router.get('/', (req, res, next) => {
  let dbmessage = "Failed to connect to MongoDB.";
  mongoClient.connect(config.database.host, (err, db) => {
    if(err === null){
      dbmessage = "Successfully connected to MongoDB!";
    }
    res.status(200).json({
      meta: {
        success: true,
        message: 'You have successfully connected to the Bog Brunch score API!',
        database: dbmessage
      }
    });
    db.close();
  });
});

/*
* GET /highscores
*/
router.get('/highscores', (req, res, next) => {
  mongoClient.connect(config.database.host, (err, db) => {
    if(err === null){
      db.collection('highscores').find({}, {'sort':[['playerScore','desc']]}).limit(10).toArray((err, docs) => {
        if(err === null){
          res.status(200).json(docs);
        } else {
          res.status(500);
        }
      });
    }
    db.close();
  });
});

/*
* POST /highscores
*/
router.post('/highscores', (req, res, next) => {
  mongoClient.connect(config.database.host, (err, db) => {
    if(err === null){
      db.collection('highscores').insert(req.body, (err) => {
        if(err === null){
          res.status(201);
        } else {
          res.status(500);
        }
      });
    } else {
      res.status(500);
    }
    db.close();
  });
});

module.exports = router;
