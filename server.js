/**
 * Express powered API server for Covert Location Framework.
 * Developed for WebRes 2015/16 Sprint 1.
 *
 * @author T9
 */

'use strict';

// VARIABLES

// NPM Modules
var express = require('express'),
    fs = require('fs'),
    watchr = require('watchr');

// Global Objects
var CovLocGlobals = CovLocGlobals || {};
    CovLocGlobals.app = express();
    CovLocGlobals.algorithms = {};

// Static Variables
const API_BASE_URL = '/api/1/',
      ALGO_DIR = 'algorithms/';


// SERVER CONFIG

// Watch directory for changes and trigger a refresh of the algorithm data if so.
watchr.watch({
  path: ALGO_DIR,
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

// Enable CORS to allow future cross-domain API usage.
// Source: http://enable-cors.org/server_expressjs.html
CovLocGlobals.app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Set static directories to serve.
CovLocGlobals.app.use(express.static('algorithms'));
// HTTPD or Nginx might be better for serving client as it's static, but this is used for testing:
CovLocGlobals.app.use(express.static('client'));

// GET request for algorithms.
// Return list of all algorithms as JSON.
CovLocGlobals.app.get(API_BASE_URL + 'algorithms', (req, res) => {
  res.send(CovLocGlobals.algorithms);
});

// Start up server.
let server = CovLocGlobals.app.listen(8080, () => {
  let host = server.address().address,
      port = server.address().port;

  console.log(`CovLoc API running at http://${host}:${port}`);
});


/** 
 * Scan through the algorithms folder for files.
 * Load each JSON descriptor into internal object to cache for better performance.
 *
 * For each file in the algorithm directory, first filter to only JSON files, 
 * then add the file's name to the global object for API requests.
 */
function refreshAlgorithms() {
  CovLocGlobals.algorithms = {};
  fs.readdir(ALGO_DIR, (err, results) => {
    if (err) {
      return console.log('Error refreshing algorithms:', err);
    } else {
      results.filter(function(file) { 
        return file.substr(-5).toLowerCase() === '.json'; 
      }).forEach((algo) => {
        fs.readFile(ALGO_DIR + algo, 'utf8', (err, data) => {
          if (err) {
            return console.log(`Error reading algorithm file ${algo} due to ${err}`);
          } else {
            // Slice off the file extension.
            CovLocGlobals.algorithms[algo.slice(0,-5)] = JSON.parse(data);
          }
        });
      });     
    }
  });
}
