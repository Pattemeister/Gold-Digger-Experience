
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
var server_port = process.env.OPENSHIFT_NODEJS_PORT||8080
app.set('port', server_port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev')); // logger!

app.use(express.static(path.join(__dirname, 'public')));
  
app.get('/', routes.index);



var server_ip_adress = process.env.OPENSHIFT_NODEJS_IP||'127.0.0.1'


var server = http.createServer(app).listen(server_port ,server_ip_adress, function(){
  console.log("Listening on port " + server_ip_adress + app.get('port'));
});

require('./routes/sockets.js').initialize(server);

