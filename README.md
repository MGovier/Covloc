# Covert Location Advisor (CovLoc)
Code for WebRes 2015/16 Sprint 1 by Team T9.

Covert location advisor using Google Maps API.

## About
Uses NodeJS and Express to run the server, use `npm init` to pull in dependencies, then `node server.js` to run.

Server will listen on port 8080 by default, and will serve requests at root. Simple API runs at `api/1/algorithms`, which is used by the client to populate available algorithms and add them to an internal object. The client will attempt to call `run()` on this object when the menu item is selected.

## Adding Algorithms
Adding a new algorithm requires 2 files to be placed in the server's `algorithm` folder:

A short JSON descriptor of the format:

```json
{
  "name":"ExampleAlgo",
  "description": "Test Things Are Working",
  "file": "ExampleAlgo.js"
}
```

Along with a JS file which will add a run function to a uniquely named object:

```javascript
'use strict';

covertMap.algorithms.ExampleAlgo = function () {
  function run() {
    console.log('It works!');
  }
  return {
    run: run
  }
}();
```

## Built by T9
* Merlin Govier
* Christopher Scholes
* Sam Davies
