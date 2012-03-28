
/**
 * Module dependencies.
 */
var express = require('express')
  , db = require('dirty')('users.db')
  , dirtyUuid = require('dirty-uuid')
  , app = module.exports = express.createServer();


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  // app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// Routes
app.get('/users', function (req, res) {
  var list = [];
  db.forEach(function (id, user) {
    if (id && user) list.push(user);
  });
  res.send(JSON.stringify(list));
});

app.get('/users/:id', function (req, res) {
  found = false;
  
  db.forEach(function (id, user) {
    if (id === req.params.id) {
      res.send(user);
      found = true;
    }
  });

  if (!found) {
    throw 'Not user found.';
  }
});

function saveOrUpdateUser(data) {
  var user = data;
  user['id'] = dirtyUuid();
  db.set(user['id'], user);
  return db.get(user['id']);
}

app.post('/users', function (req, res) {
  var user = saveOrUpdateUser(req.body);
  res.statusCode = 201;
  res.send(user);
});

app.put('/users', function (req, res) {
  var user = saveOrUpdateUser(req.body);
  res.statusCode = 201;
  res.send(user);
});

app.delete('/users', function (req, res) {
  db.rm(req.params.id);
  res.send('{}');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
