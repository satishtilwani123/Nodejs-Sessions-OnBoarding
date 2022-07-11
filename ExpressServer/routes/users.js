var express = require('express');
const User = require('../model/user');

const router = express.Router();

router.post('/Signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(!user){
      User.create(req.body)
      .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: "User is Successfully Registered!", data: user})
      }).catch((err) => next(err))
    } else {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: "You are already Registered!"})
    }
  })
})

router.post('/Login', (req, res, next) => {
  if(!req.session.user)
  {
    var auth_header = req.headers.authorization;

    if(!auth_header){
      var err = new Error("You are not authenticated");
      err.status = 401;
      res.setHeader('WWW-Authenticate', 'Basic');
      return next(err);
    }

    var Buff = new Buffer.from(auth_header.split(' ')[1], 'base64').toString().split(':');
    var usernames = Buff[0];
    var password = Buff[1];

    User.findOne({username: usernames})
    .then((user) => {
      if(usernames == user.username && password == user.password){
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: "You are Logined!"});
      } else {
        var err = new Error("You are not authenticated");
        err.status = 401;
        res.setHeader('WWW-Authenticate', 'Basic');
        return next(err);
      }
    }).catch((err) => next(err))
  } else {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false, status: "You are already Logined!"})
  }
})

router.get('/Logout', (req, res, next) => {
  if(req.session.user){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false, status: "You are already Logout!"})
  }
})

module.exports = router;