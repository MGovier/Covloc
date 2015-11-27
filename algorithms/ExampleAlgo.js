'use strict';

covertMap.algorithms.ExampleAlgo = function () {
  function run() {
    console.log('It works!');
  }
  return {
    run: run
  }
}();