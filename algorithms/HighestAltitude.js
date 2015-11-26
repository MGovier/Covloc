'use strict';

covertMap.algorithms.HighestAltitude = function () {

  function run() {
    if (covertMap.circle) {
      let bounds = covertMap.circle.getBounds(),
          ne = bounds.getNorthEast(),
          sw = bounds.getSouthWest(),
          se = new google.maps.LatLng(sw.lat(), ne.lng()),
          coords = [],
          hSteps = Math.abs(sw.lng() - se.lng()) / 10,
          vSteps = Math.abs(ne.lat() - se.lat()) / 10,
          highest,
          highestPoint = 0,
          elevator = new google.maps.ElevationService();

      for (let i = sw.lng(); i <= se.lng(); i += hSteps) {
        for (let j = se.lat(); j <= ne.lat(); j += vSteps) {
          coords.push(new google.maps.LatLng(j, i));
        }
      }

      elevator.getElevationForLocations({
        'locations': coords
      }, function(results, status) {
        if (status === google.maps.ElevationStatus.OK) {
          // Retrieve the first result
          if (results[0]) {
            for (var i = 0; i < results.length; i++) {
              if (results[i].elevation > highestPoint) {
                highest = results[i];
                highestPoint = results[i].elevation;
              }
            }
            let marker = new google.maps.Marker({
              position: highest.location,
              map: covertMap.map,
              label: 'H',
              title: `This is the highest point with an elevation of ${highestPoint.toFixed(4)} meters.`
            });
            let infowindow = new google.maps.InfoWindow({
              content: `This is the highest point with an elevation of ${highestPoint.toFixed(4)} meters.`
            });
            infowindow.open(covertMap.map, marker);
          } else {
            console.log('No results found.');
          }
        } else {
          console.log('Elevation service error with status: ' + status);
        }
      });
    } else {
      alert('Sorry, this algorithm requires an area to be searched for and a radius defined. Please select choose location and try again!');
    }
  }

  return {
    run: run
  };

}();