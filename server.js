const express = require('express');
const app = express();
app.get('/', function (req, res) {
  res.status(200).send('ok');
});

const server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});
module.exports = server;

