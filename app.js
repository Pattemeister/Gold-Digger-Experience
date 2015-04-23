
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var favicon = require('serve-favicon');
var morgan = require('morgan');

var app = express();

/* fixed for Express 4.x according to 
   https://github.com/strongloop/express/wiki/Migrating-from-3.x-to-4.x
 */
app.set('port', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev')); // logger!

app.use(express.static(path.join(__dirname, 'public')));
  
app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

require('./routes/sockets.js').initialize(server);

