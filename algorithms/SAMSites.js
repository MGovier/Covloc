'use strict';

covertMap.algorithms.SAMSites = function () {

  function run() {    
    // (a) Add current SAMs
    addCurrentSAMLocations();
    
    // Callback to be executed by the getElevation function when it is finished.
    var elevationServiceComplete = function(collectionOfElevations) {
      var totalElevation = 0;
      for (var i = 0; i < collectionOfElevations.length; i++) {
        console.log('we in');
        totalElevation += collectionOfElevations[i];
      }

      // (b) Calculate average of current sites
      //var distances = getDistancesFromSea();
      var averageElevation = totalElevation / collectionOfElevations.length;
      console.log( 'The average: ' + averageElevation)

      // (c) Set SAM site elevation boundaries
      console.log( 'The midrange: ' + getElevationBoundaries(collectionOfElevations) );
    };

    getElevation(locations, elevationServiceComplete);
  }

  function getElevation(collectionOfLocations, elevationServiceComplete) {
    var collectionOfElevations = [];
    var elevator = new google.maps.ElevationService();
    var elevatorResponse = function(results, status) {
      if (status === google.maps.ElevationStatus.OK) {
        var val = results[0].elevation;
        collectionOfElevations.push(val);
        // Test if all of our requests have now been returned
        if (collectionOfElevations.length === collectionOfLocations.length) {
          elevationServiceComplete(collectionOfElevations);
        }
      } else {
        alert('Google Elevation API Error in SAMSites');
      }
    };

    // Loop through locations
    for (var i = 0;i < collectionOfLocations.length; i++) {
      var lat = collectionOfLocations[i][1];
      var lon = collectionOfLocations[i][2];

      var latLon = { lat: lat, lng: lon };

      elevator.getElevationForLocations({ 
        'locations': [latLon]
      }, elevatorResponse);
    }

    //console.log('The money: ' + collectionOfElevations);
    return collectionOfElevations;
  }

  function getElevationBoundaries(elevations) {
    for (var i = 0;i < elevations.length;i++) {
      // Best way to get boundaries????
    }

    var max = Math.max.apply(Math, elevations);
    var min = Math.min.apply(Math, elevations);

    return max - min;
  }

  function getDistancesFromSea() {

  }

  var locations;  
  function addCurrentSAMLocations() {
    locations = [
    ['England',  55.0517923211, -2.55790018136 , 1],
    ['France',  47.7873344622, 6.34956062139  , 2],
    ['France',  48.6355062273, 4.90134469371 , 3],
    ['France',  47.0571024196, 2.63520947243 , 4],
    ['France',  43.5176364593, 4.92771362148  , 5],
    ['France',  43.5176364593, 4.92771362148  , 6],
    ['France',  43.9118541239, -0.499979705002 , 7],
    ['spain',  37.6078102302, -1.02401270745 , 8],
    ['germany', 48.0748293196, 10.8973230551 , 9],
    ['germany',  48.7029502418, 11.4374623747 , 10],
    ['germany',  49.4420417433, 7.69231297144 , 11],
    ['germany',  54.0812813073, 12.6751894549   , 12],
    ['netherlands',  51.5177310506, 5.87103097117  , 13],
    ['denmark',  54.7424370253, 9.03667155729   , 14],
    ['italy',  45.0105418207, 10.813257  , 15],    
    ['slovakia',  48.3378623579, 17.9212248592  , 16],
    ['albania',  41.2441446538, 19.8306914692  , 17],
    ['greece',  38.337154, 23.556117  , 18],
    ['greece',  40.6573701253, 23.0247654546  , 19],
    ['greece',  35.3339406285, 25.1778278571  , 20],
    ['greece',  38.5829656307, 26.4904326071  , 21],
    ['greece',  40.9144082648, 24.60913305077  , 22],
    ['greece',40.53705646, 23.0257893018   , 23],
    ['turkey',  36.8632597849, 28.3187663656  , 24],
    ['bulgaria',  42.2113778215, 24.886893043  , 25],
    ['bulgaria',  42.7316372891, 23.395959304 , 26],
    ['romania',  44.1197443427, 26.068306  , 27],
    ['romania',  44.4003135137, 25.628965  , 28],
    ['romania',  45.8556750156, 25.6632601352  , 29],
    ['romania',  44.7572629962, 26.469901  , 30],
    ['ukraine',  45.1491846191, 35.7223712915 , 31],
    ['ukraine',  46.7303425219, 33.3818334529  , 32],
    ['ukraine',  46.5699370098, 30.8806277359 , 33],
    ['ukraine',  46.9848574569, 32.0962095282  , 34],
    ['ukraine',  47.6519672743, 34.546666 , 35],
    ['ukraine',  47.9708646585, 30.9054358838 , 36],
    ['ukraine',  48.3874221439, 34.893212193 , 37],
    ['ukraine',  50.2782128092, 30.8113019284  , 38],
    ['ukraine',  49.9327437316, 36.2903408807  , 39],
    ['Belarus',  53.8653508586, 27.0828145193 , 40],
    ['Belarus',  52.0410543796, 23.692221203  , 41],
    ['Belarus',  53.7290121508, 23.8661613224  , 42],
    ['russia',  55.083341496, 21.8722428987 , 43],
    ['russia',  54.8717553817, 19.9538143131 , 44],
    ['russia',  54.4808053926, 19.91432  , 45],
    ['russia',  54.7478248936, 19.9706574888  , 46]
    ];

    // Could get locations dynamically, e.g. assign values to 'locations'

    var infowindow = new google.maps.InfoWindow();

    // Loop through markers, adding the to map
    for (var i = 0; i < locations.length; i++) {  
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
        map: covertMap.map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          // Capitalise first letter of location
          infowindow.setContent(locations[i][0].charAt(0).toUpperCase() + locations[i][0].slice(1));
          infowindow.open(covertMap.map, marker);
        };
      })(marker, i));
    }
  }
  return {
    run: run
  };
}();