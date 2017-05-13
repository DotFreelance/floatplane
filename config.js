var config = {
development: {
  // local mongodb
  database: {
    host:   'mongodb://127.0.0.1:27017/bog-brunch'
  }
},
production: {
  // heroku mongodb
  database: {
    host: '127.0.0.1',
  }
}
};
module.exports = config;
