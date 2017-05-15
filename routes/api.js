var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var env = process.env.NODE_ENV || 'development';
var config = require('./../config')[env];

/*
* GET /highscores
*/
router.get('/highscores', (req, res, next) => {
  // Connect to MongoDB
  mongoClient.connect(config.database.host, (err, db) => {
    if(err === null){
      // Check 'highscores' for documents, the top 10, descending by playerScore
      db.collection('highscores').find({}, {'sort':[['playerScore','desc']]}).limit(10).toArray((err, docs) => {
        if(err === null){
          // This part sends off the requested information, including a rendered version of the partial in views/partials/scores.pug
          res.render('partials/scores', {highscores: docs}, function(err, html){
              res.status(200).json({data: docs, rendered: html});
          });
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
  // Connect to MongoDB
  mongoClient.connect(config.database.host, (err, db) => {
    if(err === null){
      // Send a 202 ACCEPTED immediately, then insert the score
      // The client doesn't really need to wait all that time for us to complete
      res.sendStatus(202);
      db.collection('highscores').insert(req.body);
    } else {
      res.sendStatus(500);
    }
    db.close();
  });
});


/*
* GET /
* This is just a fun function that lets you know you've successfully accessed the Bog Brunch API
*/
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

module.exports = router;
