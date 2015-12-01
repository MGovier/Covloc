'use strict';

covertMap.algorithms.SAMSites = function () {

  function run() {    
    // (a) Add current SAMs
    addCurrentSAMLocations();
    
    // Callback to be executed by the getElevation function when it is finished.
    var elevationServiceComplete = function(collectionOfElevations) {
      var totalElevation = 0;
      for (var i = 0; i < collectionOfElevations.length; i++) {
        totalElevation += collectionOfElevations[i];
      }

      // (b) Calculate average of current sites
      var averageElevation = totalElevation / collectionOfElevations.length;
      console.log( 'The average: ' + averageElevation)
    };

    getElevation(locations, elevationServiceComplete);

    // FIND closest SAM site geographically
    var circCentre = new google.maps.LatLng(covertMap.circle.center.lat(), covertMap.circle.center.lng());
    getClosestSAMAltitude(circCentre);
    var closestSamAlt;
    

    // CALCULATE the average elevation for selected radius
    //compareElevations(circCentre, radius);

    // COMPARE points in selected radius to altitude of SAM site
    // IF fails, then run against average of all SAM sites, seeing if it fits 
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
      var lng = collectionOfLocations[i][2];

      var latLng = { lat: lat, lng: lng };

      elevator.getElevationForLocations({ 
        'locations': [latLng]
      }, elevatorResponse);
    }

    return collectionOfElevations;
  }

  function getClosestSAMAltitude(centre) {

    // Find closest SAM
    let closestSAM = { id: "", latLng: 0 };

    for (let i = 0;i < locations.length;i++) {
      let samLoc = new google.maps.LatLng(locations[i][1], locations[i][2]);
      var distance = google.maps.geometry.spherical.computeDistanceBetween(centre, samLoc);

      if (i === 0 || distance < closestSAM.latLng) { 
        closestSAM.id = i; 
        closestSAM.latLng = samLoc; 
      }
    }

    function closestSAMAltitudeFound(alt) {
      // ************
      // TODO: Iterate through altitudes looking for acceptable margin.
      // Or return no suitable position.
      console.log('alt', alt);
    }

    // When elevation has completed
    var closestSAMAltResponse = function(results, status) {
      if (status === google.maps.ElevationStatus.OK) {
        let altitude = results[0].elevation;
        closestSAMAltitudeFound(altitude);
      } else {
        console.log(status);
      }
    }

    var elevator = new google.maps.ElevationService();
    console.log('closest sam:', closestSAM.latLng);
    elevator.getElevationForLocations({ 
        'locations': [closestSAM.latLng]
      }, closestSAMAltResponse);
  }


  function compareElevations(centre, radius) {

  }

  var locations;  
  function addCurrentSAMLocations() {
    locations = [
    ['England',  55.0517923211, -2.55790018136 , 1],
    ['France',  47.7873344622, 6.34956062139  , 2],
    ['France',  48.6355062273, 4.90134469371 , 3],
    ['France',  47.0571024196, 2.63520947243 , 4],
    ['France',  43.5176364593, 4.92771362148  , 5],
    ['France',  43.9118541239, -0.499979705002 , 6],
    ['spain',  37.6078102302, -1.02401270745 , 7],
    ['germany', 48.0748293196, 10.8973230551 , 8],
    ['germany',  48.7029502418, 11.4374623747 , 9],
    ['germany',  49.4420417433, 7.69231297144 , 10],
    ['germany',  54.0812813073, 12.6751894549   , 11],
    ['netherlands',  51.5177310506, 5.87103097117  , 12],
    ['denmark',  54.7424370253, 9.03667155729   , 13],
    ['italy',  45.0105418207, 10.813257  , 14],    
    ['slovakia',  48.3378623579, 17.9212248592  , 15],
    ['albania',  41.2441446538, 19.8306914692  , 16],
    ['greece',  38.337154, 23.556117  , 17],
    ['greece',  40.6573701253, 23.0247654546  , 18],
    ['greece',  35.3339406285, 25.1778278571  , 19],
    ['greece',  38.5829656307, 26.4904326071  , 20],
    ['greece',  40.9144082648, 24.60913305077  , 21],
    ['greece',40.53705646, 23.0257893018   , 22],
    ['turkey',  36.8632597849, 28.3187663656  , 23],
    ['bulgaria',  42.2113778215, 24.886893043  , 24],
    ['bulgaria',  42.7316372891, 23.395959304 , 25],
    ['romania',  44.1197443427, 26.068306  , 26],
    ['romania',  44.4003135137, 25.628965  , 27],
    ['romania',  45.8556750156, 25.6632601352  , 28],
    ['romania',  44.7572629962, 26.469901  , 29],
    ['ukraine',  45.1491846191, 35.7223712915 , 30],
    ['ukraine',  46.7303425219, 33.3818334529  , 31],
    ['ukraine',  46.5699370098, 30.8806277359 , 32],
    ['ukraine',  46.9848574569, 32.0962095282  , 33],
    ['ukraine',  47.6519672743, 34.546666 , 34],
    ['ukraine',  47.9708646585, 30.9054358838 , 35],
    ['ukraine',  48.3874221439, 34.893212193 , 36],
    ['ukraine',  50.2782128092, 30.8113019284  , 37],
    ['ukraine',  49.9327437316, 36.2903408807  , 38],
    ['Belarus',  53.8653508586, 27.0828145193 , 39],
    ['Belarus',  52.0410543796, 23.692221203  , 40],
    ['Belarus',  53.7290121508, 23.8661613224  , 41],
    ['russia',  55.083341496, 21.8722428987 , 42],
    ['russia',  54.8717553817, 19.9538143131 , 43],
    ['russia',  54.4808053926, 19.91432  , 44],
    ['russia',  54.7478248936, 19.9706574888  , 45]
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