var express = require('express');
var methodOverride = require('method-override');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session"),
 MongoStore = require("connect-mongo")(session);

var app = express();

//connect to db
var mongoose = require("mongoose")
mongoose.connect("mongodb://localhost/iotdb", function(err){
  if(err)
    throw err;  
    console.log("Connected to mongodb")
});

//wire-in the models

//user model
var userModel = require('./models/users');
// userModel.methods(['get','post','put','delete']);
// userModel.register(app,'/users');

//dataset model
var datasetModel = require('./models/dataset');
// datasetModel.methods(['get','post','put','delete']);
// datasetModel.register(app,'/datasets');
var ruleModel = require('./models/rules');
var logicserverModel = require('./models/logicserver')
var applicationModel = require('./models/applications');
var applicationModel = require('./models/applications');
var gatewayModel = require('./models/gateway');
var gatewayTypeModel = require('./models/gateway_type');
var sensorTypeModel = require('./models/sensor_type');
var registerGatewayModel = require('./models/register_gateway');
var appUserModel = require('./models/app_users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// We use mongodb to store session info
// expiration of the session is set to 7 days (ttl option)
app.use(session({
    store: new MongoStore({mongooseConnection: mongoose.connection,
                          ttl: 7*24*60*60}),
    saveUninitialized: true,
    resave: true,
    secret: "MyBigBigSecret"
}));

// used to manipulate post requests and recongize PUT and DELETE operations
app.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === "object" && "_method" in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

//setup routes
var routes = require('./routes/index');
var users = require('./routes/users');
var datasets = require('./routes/dataset');
var rules = require('./routes/rules');
var logicserver = require('./routes/logicserver');
var applications = require('./routes/applications');
var gateways = require('./routes/gateway');
var gatewaytype = require('./routes/gateway_type');
var sensortype = require('./routes/sensor_type');
var registerGateway = require('./routes/register_gateway');
var api = require('./routes/api');


app.use('/', routes);
app.use('/users', users);
app.use('/datasets', datasets);
app.use('/rules',rules);
app.use('/api',api);
app.use('/logicservers',logicserver);
app.use('/applications',applications);
app.use('/signup',applications);
app.use('/gateways',gateways);
app.use('/gatewaytypes',gatewaytype);
app.use('/sensortypes',sensortype);
app.use('/registergateways',registerGateway);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
