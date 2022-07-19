var express = require('express');
const app = require('../app');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

function logOriginUrl(req, res, next) {
  console.log('Request URL: ', req.originalUrl)
  next()
}

function logMethod(req, res, next) {
  console.log('Request Type: ', req.method)
  next()
}

const logStuff = [logOriginUrl, logMethod]
router.get('/user/:id', logStuff, (req, res, next) => {
  res.send('User Info')
})

module.exports = router;
