'use strict';

var express = require('express'),
    app = express(),
    fs = require('fs');

app.get('/api/1/algorithms', (req, res) => {
  fs.readdir('algorithms', (err, results) => {
    if (err) {
      res.status(500);
      res.send('Server error when looking for algorithms');
    }
    res.send(results);
  }); 
});

var server = app.listen(8080, () => {
  var host = server.address().address,
      port = server.address().port;

  console.log('CovLoc API running at http://%s:%s', host, port);
});