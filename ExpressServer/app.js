var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const session = require('express-session');
const Filestore = require('session-file-store')(session); 

const url = "mongodb://localhost:27017/confusion";

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dish');

mongoose.connect(url).then((db) => {
  console.log(db);
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: 'session-id',
    secret: '1234-5678-9012-3456',
    resave: false,
    saveUninitialized: false,
    store: new Filestore
}))

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);

//Cookies Authentication
function auth(req, res, next) {
  if(!req.session.user)
  {
    var err = new Error("You are not authenticated");
    err.status = 401;
    return next(err);
  } else {
    if(req.session.user == 'authenticated') {
      next();
    } else {
      var err = new Error("You are not authenticated");
      err.status = 401;
      return next(err);
    }
  }
}

app.use(auth);

app.use('/', indexRouter);
app.use('/dishes', dishRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
