'use strict';

// NPM Modules
var express = require('express'),
    fs = require('fs'),
    watchr = require('watchr');

// Global Objects
var CovLocGlobals = CovLocGlobals || {};
    CovLocGlobals.app = express();
    CovLocGlobals.algorithms = {};

// Static Variables
var API_BASE_URL = '/api/1/',
    ALGO_DIR = 'algorithms/';


// Watch directory for changes and trigger a refresh of the data if so.
watchr.watch({
  path: 'algorithms',
  listeners: {
    error: (err) => {
      console.log('Error:', err);
    },
    watching: (err) => {
      if (err) {
        console.log('Error watching directory due to:', err);
      } else {
        console.log('Watching algorithms folder for changes...');
      }
    },
    change: () => {
      console.log('Algorithms change detected, refreshing.');
      refreshAlgorithms();
    }
  },
  next: (err) => {
    if (err) {
      return console.log('Could not generate API due to:', err);
    } else {
      refreshAlgorithms();
    } 
  }
});

CovLocGlobals.app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

CovLocGlobals.app.use(express.static('algorithms'));
CovLocGlobals.app.use(express.static('client'));

// GET request for algorithms.
// Return list of all algorithms as JSON.
CovLocGlobals.app.get(API_BASE_URL + 'algorithms', (req, res) => {
  res.send(CovLocGlobals.algorithms);
});

// CovLocGlobals.algorithmList.forEach((algo) => {
//   CovLocGlobals.app.get(API_BASE_URL + algo, (req, res) => {
//     res.send()
//   });
// });

// Start up server.
var server = CovLocGlobals.app.listen(8080, () => {
  var host = server.address().address,
      port = server.address().port;

  console.log('CovLoc API running at http://%s:%s', host, port);
});

// Scan through the algorithms folder for files.
// Load each JSON descriptor into internal object to cache.
function refreshAlgorithms() {
  CovLocGlobals.algorithms = {};
  fs.readdir(ALGO_DIR, (err, results) => {
    if (err) {
      return console.log('Error refreshing algorithms:', err);
    } else {
      results.filter(function(file) { 
        return file.substr(-5).toLowerCase() === '.json'; 
      }).forEach((algo) => {
        // Don't read dot-files (.DS_Store...)
        if (algo.indexOf('.') !== 0) {
          fs.readFile(ALGO_DIR + algo, 'utf8', (err, data) => {
            if (err) {
              return err;
            } else {
              CovLocGlobals.algorithms[algo.slice(0,-5)] = JSON.parse(data);
            }
          });
        }
      });     
    }
  });
}
